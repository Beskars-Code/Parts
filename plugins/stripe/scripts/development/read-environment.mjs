import { existsSync, readFileSync } from "node:fs";
import { parseEnv } from "node:util";

export function readEnvironment() {
	const local = existsSync(".env.local") ? parseEnv(readFileSync(".env.local", "utf8")) : {};
	const environment = { ...local, ...process.env };
	for (const name of ["VITE_CONVEX_URL", "VITE_CONVEX_SITE_URL"]) {
		const value = local[name];
		if (value !== undefined && value !== "") {
			environment[name] = value;
		}
	}
	return environment;
}
