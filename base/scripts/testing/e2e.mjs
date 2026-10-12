import { spawnSync } from "node:child_process";
import { existsSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const runtimeBinary = statSync(process.execPath, { bigint: true });

function isRuntimeAlias(candidate) {
	const binary = statSync(candidate, { bigint: true });
	return binary.dev === runtimeBinary.dev && binary.ino === runtimeBinary.ino;
}

function findNodeExecutable() {
	const filename = process.platform === "win32" ? "node.exe" : "node";
	const directories = (process.env.PATH ?? "").split(path.delimiter);
	for (const directory of directories) {
		const candidate = path.resolve(directory, filename);
		if (!existsSync(candidate) || isRuntimeAlias(candidate)) {
			continue;
		}
		return candidate;
	}
	throw new Error("TesterArmy requires a supported Node runtime on PATH. See instructions/e2e.md.");
}

const cli = fileURLToPath(new URL("../../node_modules/e2e/dist/cli/bin.js", import.meta.url));
const executable = process.versions.bun === undefined ? process.execPath : findNodeExecutable();
const result = spawnSync(executable, [cli, "run", ...process.argv.slice(2)], { stdio: "inherit" });
if (result.error !== undefined) {
	throw new Error("TesterArmy requires a supported Node runtime on PATH. See instructions/e2e.md.", { cause: result.error });
}
process.exitCode = result.status ?? 1;
