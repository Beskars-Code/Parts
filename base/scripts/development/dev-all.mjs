import { createConnection } from "node:net";
import { setTimeout } from "node:timers/promises";

import { frontendPort } from "./frontend-environment.mjs";
import { DevelopmentProcesses } from "./processes.mjs";
import { prepareStartup, selectedConfiguration, startupMode } from "./startup/configuration.mjs";
import { convexArguments, startupOptions } from "./startup/options.mjs";

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
	if (used.includes(true)) { throw new Error(`Port ${port} is occupied. Stop existing development processes before startup.`); }
}

async function preflight(selected, options) {
	const environment = { VITE_CONVEX_URL: selected.connection.apiUrl, VITE_CONVEX_SITE_URL: selected.connection.siteUrl };
	const args = convexArguments(options, selected.deployment, environment);
	const ports = [frontendPort(process.env.PORT)];
	if (selected.isLocal) {
		ports.push(...Object.values(selected.connection).map(value => {
			const url = new URL(value);
			return url.port || "80";
		}));
	}
	const uniquePorts = new Set(ports);
	if (uniquePorts.size !== ports.length) { throw new Error("Frontend, Convex API, and Convex HTTP site ports must be distinct."); }
	for (const port of ports) { await requireFreePort(port); }
	return args;
}

async function backendReady(environment, signal) {
	try {
		const response = await fetch(`${environment.VITE_CONVEX_URL}/version`, { signal: AbortSignal.any([signal, AbortSignal.timeout(1000)]) });
		return response.ok;
	} catch { return false; }
}

async function waitForBackend(environment, signal) {
	for (let attempt = 0; attempt < 120; attempt += 1) {
		signal.throwIfAborted();
		if (await backendReady(environment, signal)) { return; }
		await setTimeout(1000, undefined, { signal });
	}
	throw new Error("Convex did not become available. Check its terminal diagnostics and deployment configuration.");
}

const processes = new DevelopmentProcesses();
let startup;

try {
	const requested = startupMode(process.argv.slice(2));
	const options = startupOptions(requested.argv);
	const selected = selectedConfiguration(requested.mode, options);
	const args = await preflight(selected, options);
	startup = await prepareStartup(selected, processes.signal);
	await processes.run("Better Auth schema", ["run", "codegen:auth"], startup.environment);
	await processes.run("Confect codegen", ["run", "codegen:confect"], startup.environment);
	processes.start("Convex", ["run", "dev:convex", ...args], startup.convexEnvironment);
	await processes.wait(() => waitForBackend(startup.environment, processes.signal));
	await processes.wait(() => startup.seed());
	processes.start("Confect", ["run", "dev:confect"], startup.environment);
	processes.start("Vite", ["node_modules/vite/bin/vite.js", "--port", startup.environment.PORT, "--strictPort"], startup.environment);
	console.log(`Development services starting at ${startup.environment.SITE_URL}. Press Ctrl+C to stop owned processes.`);
	await processes.wait(() => new Promise(() => {}));
} catch (error) {
	if (!processes.stopping) {
		console.error(Error.isError(error) ? error.message : "Development startup failed.");
		processes.stop(1);
	}
} finally {
	startup?.restore();
}
