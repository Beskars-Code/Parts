import { appVariables, isPublicKey, validateRequired } from "./catalog.mjs";
import { readDeploymentConnection, validateConnection } from "./connection.mjs";
import { readConvexVariables } from "./convex.mjs";
import { readDotenv } from "./dotenv.mjs";

export { executionEnvironment } from "./process.mjs";
export { readDeploymentConnection } from "./connection.mjs";

async function sourceVariables(source, envFile, connection, signal) {
	if (source === "convex") {
		const selected = readDeploymentConnection(envFile);
		const normalized = validateConnection(connection, selected.deployment);
		return { raw: await readConvexVariables(envFile, signal), connection: normalized };
	}
	if (source === "dotenv") {
		return { raw: readDotenv(envFile), connection: validateConnection(connection, { type: "anonymous" }) };
	}
	throw new Error("Unknown application environment source.");
}

export async function prepareEnvironment({ source, envFile = ".env.local", connection, signal }) {
	const selected = await sourceVariables(source, envFile, connection, signal);
	const app = appVariables(selected.raw);
	validateRequired(app);
	const runtime = { ...app, VITE_CONVEX_URL: selected.connection.apiUrl, VITE_CONVEX_SITE_URL: selected.connection.siteUrl };
	const entries = Object.entries(runtime);
	return {
		runtime,
		public: Object.fromEntries(entries.filter(([name]) => isPublicKey(name))),
		private: Object.fromEntries(entries.filter(([name]) => !isPublicKey(name))),
		connection: selected.connection,
	};
}
