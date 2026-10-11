import { createConnection } from "node:net";
import { setTimeout } from "node:timers/promises";

import { requireCloudUrl, requireDevelopmentTarget, requireLocalUrl } from "./agent-deployment.mjs";
import { frontendEnvironment, frontendPort } from "./frontend-environment.mjs";
import { DevelopmentProcesses } from "./processes.mjs";
import { readEnvironment } from "./read-environment.mjs";

function portInUse(port, host) {
	return new Promise(resolve => {
		const socket = createConnection({ port: Number(port), host });
		const finish = isUsed => { socket.destroy(); resolve(isUsed); };
		socket.once("connect", () => finish(true));
		socket.once("error", () => finish(false));
		socket.setTimeout(1000, () => finish(false));
	});
}

async function requireFreePort(port) {
	const used = await Promise.all([portInUse(port, "127.0.0.1"), portInUse(port, "::1")]);
	if (used.includes(true)) {
		throw new Error(`Port ${port} is occupied. Stop the existing development processes before running dev:all.`);
	}
}

async function preflight(environment) {
	const target = requireDevelopmentTarget(environment);
	await requireFreePort(frontendPort(environment.PORT));
	if (target.type === "dev") {
		if (environment.VITE_CONVEX_URL) { requireCloudUrl(environment.VITE_CONVEX_URL, target.name); }
		return;
	}
	const local = frontendEnvironment(environment);
	for (const endpoint of [local.VITE_CONVEX_URL, local.VITE_CONVEX_SITE_URL]) {
		requireLocalUrl(endpoint);
		const url = new URL(endpoint);
		await requireFreePort(url.port || "80");
	}
}

async function backendReady(environment, signal) {
	try {
		const response = await fetch(`${environment.VITE_CONVEX_URL}/version`, { signal: AbortSignal.any([signal, AbortSignal.timeout(1000)]) });
		return response.ok;
	} catch {
		return false;
	}
}

async function waitForBackend(signal) {
	for (let attempt = 0; attempt < 120; attempt += 1) {
		signal.throwIfAborted();
		const environment = readEnvironment();
		if (environment.VITE_CONVEX_URL && await backendReady(environment, signal)) { return frontendEnvironment(environment); }
		await setTimeout(1000, undefined, { signal });
	}
	throw new Error("Convex did not become available. Check its terminal diagnostics and deployment configuration.");
}

const processes = new DevelopmentProcesses();

try {
	await preflight(readEnvironment());
	await processes.run("Better Auth schema", ["run", "codegen:auth"]);
	await processes.run("Confect codegen", ["run", "codegen:confect"]);
	processes.start("Convex", ["run", "dev:convex", ...process.argv.slice(2)]);
	processes.start("Confect", ["run", "dev:confect"]);
	const environment = await processes.wait(() => waitForBackend(processes.signal));
	processes.start("Vite", ["--bun", "run", "vite", "--port", environment.PORT, "--strictPort"], environment);
	console.log(`Development services starting at ${environment.SITE_URL}. Press Ctrl+C to stop owned processes.`);
	await processes.wait(() => new Promise(() => {}));
} catch (error) {
	if (!processes.stopping) {
		console.error(Error.isError(error) ? error.message : "Development startup failed.");
		processes.stop(1);
	}
}
