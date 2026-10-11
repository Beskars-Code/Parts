import { spawnSync } from "node:child_process";
import { createReadStream, existsSync } from "node:fs";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import createCLIOptions from "../../node_modules/eslint/lib/options.js";

function shouldCaptureReport(args) {
	try {
		return createCLIOptions(process.env.ESLINT_USE_FLAT_CONFIG !== "false").parse(args, { slice: 0 }).outputFile === undefined;
	} catch {
		return false;
	}
}

const args = process.argv.slice(2);
const separator = args.indexOf("--");
const optionEnd = separator === -1 ? args.length : separator;
const directory = shouldCaptureReport(args) ? await mkdtemp(path.join(tmpdir(), "parts-eslint-")) : undefined;
const outputFile = directory === undefined ? undefined : path.join(directory, "report");
const forwarded = [...args];
if (outputFile !== undefined) {
	forwarded.splice(optionEnd, 0, "--output-file", outputFile);
}

async function streamReport(file) {
	const report = createReadStream(file, { highWaterMark: 32 * 1024 });
	for await (const chunk of report) {
		await new Promise((resolve, reject) => {
			process.stdout.write(chunk, (error) => {
				if (error) {
					reject(error);
					return;
				}
				resolve();
			});
		});
	}
}

async function printReport(file) {
	if (file !== undefined && existsSync(file)) {
		await streamReport(file);
	}
}

const binary = fileURLToPath(new URL("../../node_modules/eslint/bin/eslint.js", import.meta.url));
const result = spawnSync(process.execPath, [binary, ...forwarded], { stdio: "inherit" });
try {
	await printReport(outputFile);
} finally {
	if (directory !== undefined) {
		await rm(directory, { recursive: true });
	}
}
if (result.error) {
	process.stderr.write(`ESLint: ${result.error.message}\n`);
}
if (result.signal) {
	process.stderr.write(`ESLint: terminated by ${result.signal}\n`);
	process.kill(process.pid, result.signal);
}
process.exitCode = result.status ?? 1;
