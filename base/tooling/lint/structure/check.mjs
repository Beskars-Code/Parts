import lintStructure from "./scan.mjs";

const diagnostics = lintStructure(process.cwd());
for (const diagnostic of diagnostics) {
	process.stderr.write(`${diagnostic}\n`);
}
process.stdout.write(`Structure: ${diagnostics.length} warnings (maximum 0).\n`);
process.exitCode = diagnostics.length === 0 ? 0 : 1;
