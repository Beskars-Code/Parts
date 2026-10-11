import { spawnSync } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../../", import.meta.url));
const requested = process.argv.slice(2);
const isConfect = requested[0] === "--confect";
const args = isConfect ? ["confect", ...requested.slice(1)] : requested;
const commands = [
	{ name: "Structure", binary: "tooling/lint/structure/check.mjs", args: [] },
	{ name: "i18n", binary: "tooling/i18n/check.mjs", args: [] },
	{ name: "Oxlint", binary: "node_modules/oxlint/bin/oxlint", args: ["--config", ".oxlintrc.json", "--type-aware", "--deny-warnings", "--report-unused-disable-directives-severity", "error", ...args] },
	{ name: "ESLint", binary: "tooling/lint/eslint.mjs", args: ["--max-warnings", "0", ...args] },
];

function hasSource(directory) {
	return existsSync(new URL(`../../${directory}/`, import.meta.url)) && readdirSync(new URL(`../../${directory}/`, import.meta.url), { recursive: true }).some((file) => /\.[cm]?tsx?$/.test(file) && !file.replaceAll("\\", "/").includes("_generated/"));
}

function addEffectProject(name, directory, project) {
	if (!hasSource(directory)) {
		return;
	}
	if (!existsSync(new URL(`../../${project}`, import.meta.url))) {
		throw new Error(`Missing TypeScript project for ${name}: ${project}`);
	}
	commands.push({ name, binary: "node_modules/@effect/language-service/cli.js", args: ["diagnostics", "--project", project, "--strict"] });
}

function run(command) {
	process.stdout.write(`\n${command.name}\n`);
	const binary = fileURLToPath(new URL(`../../${command.binary}`, import.meta.url));
	const result = spawnSync(process.execPath, [binary, ...command.args], { cwd: root, stdio: "inherit" });
	if (result.error) {
		process.stderr.write(`${command.name}: ${result.error.message}\n`);
	}
	if (result.signal) {
		process.stderr.write(`${command.name}: terminated by ${result.signal}\n`);
	}
	return result.status ?? 1;
}

if (!isConfect) {
	addEffectProject("Effect (app)", "src", "tsconfig.json");
	addEffectProject("Effect (Convex)", "convex", "convex/tsconfig.json");
}
addEffectProject("Effect (Confect)", "confect", "tooling/lint/confect-tsconfig.json");
const results = commands.map((command) => run(command));
process.exitCode = results.some((status) => status !== 0) ? 1 : 0;
