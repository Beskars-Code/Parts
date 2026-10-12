import { spawn } from "node:child_process";
import { existsSync, mkdtempSync, rmdirSync, unlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { finished } from "node:stream/promises";

import { resolveDeployment, selectionVariables } from "./connection.mjs";
import { readDotenv, writeDotenv } from "./dotenv.mjs";

const systemKeys = ["PATH", "Path", "HOME", "USERPROFILE", "APPDATA", "LOCALAPPDATA", "SYSTEMROOT", "SystemRoot", "WINDIR", "COMSPEC", "PATHEXT", "TEMP", "TMP", "TMPDIR", "LANG", "LC_ALL", "TERM"];

export function executionEnvironment(appVariables = {}) {
	const system = Object.fromEntries(systemKeys.filter(name => process.env[name] !== undefined).map(name => [name, process.env[name]]));
	return { ...system, ...appVariables };
}

function commandSelection(envFile) {
	const file = readDotenv(envFile);
	const selected = file.CONVEX_DEPLOYMENT ?? "";
	const values = /^(anonymous|local):/.test(selected) ? file : selectionVariables(envFile);
	const deployment = resolveDeployment(values);
	return { CONVEX_DEPLOYMENT: `${deployment.type}:${deployment.name}`, ...(values.CONVEX_DEPLOY_KEY ? { CONVEX_DEPLOY_KEY: values.CONVEX_DEPLOY_KEY } : {}) };
}

async function completeInput(child) {
	try {
		await finished(child.stdin);
	} catch {
		child.kill();
		throw new Error("Convex command input could not be delivered.");
	}
}

async function captureCommand(args, environment, input, signal) {
	const child = spawn(process.execPath, ["--no-env-file", "node_modules/convex/bin/main.js", ...args], { env: environment, stdio: ["pipe", "pipe", "pipe"], signal });
	let output = "";
	child.stdout.setEncoding("utf8");
	child.stdout.on("data", chunk => { output += chunk; });
	child.stderr.resume();
	const completion = new Promise((resolve, reject) => {
		child.once("error", () => reject(new Error("Convex environment command could not start.")));
		child.once("close", code => {
			if (code === 0) { resolve(); } else { reject(new Error("Convex environment command failed. Check the selected deployment and CLI authentication.")); }
		});
	});
	const completed = Promise.all([completion, completeInput(child)]);
	child.stdin.end(input);
	await completed;
	return output;
}

export async function runConvex(args, { envFile = ".env.local", input, signal } = {}) {
	signal?.throwIfAborted();
	const selected = commandSelection(envFile);
	if (args[0] === "codegen") {
		return captureCommand(args, executionEnvironment({
			CONVEX_DEPLOY_KEY: "",
			CONVEX_DEPLOYMENT_TOKEN: "",
			CONVEX_SELF_HOSTED_URL: "",
			CONVEX_SELF_HOSTED_ADMIN_KEY: "",
			CONVEX_OVERRIDE_ACCESS_TOKEN: "",
			CONVEX_AGENT_MODE: "",
			...selected,
		}), input, signal);
	}
	const directory = mkdtempSync(path.join(tmpdir(), "parts-convex-env-"));
	const file = path.join(directory, ".env.local");
	try {
		writeDotenv(file, selected);
		return await captureCommand([...args, "--env-file", file], executionEnvironment(), input, signal);
	} finally {
		if (existsSync(file)) { unlinkSync(file); }
		rmdirSync(directory);
	}
}
