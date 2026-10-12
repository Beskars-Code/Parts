import { validateName } from "./catalog.mjs";
import { resolveDeployment } from "./connection.mjs";
import { readDotenv } from "./dotenv.mjs";
import { runConvex } from "./process.mjs";

export async function readConvexVariables(envFile, signal) {
	const names = await runConvex(["env", "list", "--names-only"], { envFile, signal });
	const values = new Map();
	const entries = names.split(/\r?\n/).filter(value => value.length > 0);
	for (const name of entries) {
		validateName(name);
		const output = await runConvex(["env", "get", name], { envFile, signal });
		if (!output.endsWith("\n")) { throw new Error(`Environment variable ${name} has an invalid CLI response.`); }
		values.set(name, output.slice(0, -1));
	}
	return Object.fromEntries(values);
}

export async function seedConvexVariables(envFile, values, signal) {
	const selected = resolveDeployment(readDotenv(envFile));
	if (!["anonymous", "local"].includes(selected.type)) { throw new Error("App seeding requires the owned local or anonymous deployment."); }
	for (const name of ["ENV", "CLOUD_AGENT_AUTH_SECRET"]) {
		if (!Object.hasOwn(values, name)) { await runConvex(["env", "remove", name], { envFile, signal }); }
	}
	for (const [name, value] of Object.entries(values)) {
		validateName(name);
		await runConvex(["env", "set", name], { envFile, input: `${value}\n`, signal });
	}
}
