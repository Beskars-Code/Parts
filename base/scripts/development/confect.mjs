import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import path from "node:path";

const require = createRequire(import.meta.url);
const packagePath = require.resolve("@confect/cli/package.json");
const entry = path.join(path.dirname(packagePath), "bin", "confect.mjs");
const result = spawnSync(process.execPath, ["--no-env-file", entry, ...process.argv.slice(2)], { stdio: "inherit", env: process.env });

if (result.error !== undefined) { throw new Error("Confect could not start. Check the installed destination dependencies."); }
process.exitCode = result.status ?? 1;
