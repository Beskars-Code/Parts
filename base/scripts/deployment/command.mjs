import { execFile } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";

const execute = promisify(execFile);

export async function runBuildCommand(name, args, environment) {
	try {
		const { stdout } = await execute(process.execPath, ["--no-env-file", ...args], {
			env: environment,
			windowsHide: true,
			encoding: "utf8",
			maxBuffer: 32 * 1024 * 1024,
		});
		return stdout;
	} catch {
		throw new Error(`${name} failed. Check its selected configuration and installed dependencies in a private terminal; command output was withheld to protect environment values.`);
	}
}

export async function requirePackage(packageName, expectedVersion) {
	let metadata;
	const directory = path.resolve("node_modules", packageName);
	try {
		metadata = JSON.parse(await readFile(path.join(directory, "package.json"), "utf8"));
	} catch {
		throw new Error(`Import and install the selected module's ${packageName} dependency before using this command.`);
	}
	if (expectedVersion !== undefined && metadata.version !== expectedVersion) {
		throw new Error(`${packageName} must match the selected module's pinned version ${expectedVersion}.`);
	}
	return { directory, metadata };
}

export async function packageBinary(packageName) {
	const { directory, metadata } = await requirePackage(packageName);
	const binary = typeof metadata.bin === "string" ? metadata.bin : Object.values(metadata.bin)[0];
	if (typeof binary !== "string") {
		throw new TypeError(`${packageName} has no installed command entry.`);
	}
	return path.resolve(directory, binary);
}
