import { existsSync } from "node:fs";

import { readDotenv } from "./dotenv.mjs";

const loopback = new Set(["localhost", "127.0.0.1", "[::1]"]);

function origin(value, name) {
	let url;
	try { url = new URL(value); } catch { throw new Error(`Invalid environment variable ${name}.`); }
	if (url.href !== `${url.origin}/`) { throw new Error(`Invalid environment variable ${name}.`); }
	return url;
}

export function validateConnection(connection, deployment) {
	const api = origin(connection.apiUrl, "VITE_CONVEX_URL");
	const site = origin(connection.siteUrl, "VITE_CONVEX_SITE_URL");
	if (["local", "anonymous"].includes(deployment.type)) {
		if ([api, site].some(url => url.protocol !== "http:" || !loopback.has(url.hostname))) { throw new Error("Local Convex connection must use HTTP loopback origins."); }
	} else if (api.origin !== `https://${deployment.name}.convex.cloud` || site.origin !== `https://${deployment.name}.convex.site`) {
		throw new Error("Convex connection does not match the selected deployment.");
	}
	return { apiUrl: api.origin, siteUrl: site.origin };
}

function deploymentKey(key) {
	const matchedKey = /^(dev|prod|preview):([a-z0-9-]+)\|[^\s]+$/.exec(key);
	if (key !== "" && matchedKey === null) { throw new Error("Invalid environment variable CONVEX_DEPLOY_KEY."); }
	return matchedKey;
}

function keySelection(value = "") {
	const matchedKey = deploymentKey(value);
	return matchedKey === null ? "" : `${matchedKey[1]}:${matchedKey[2]}`;
}

export function resolveDeployment(values) {
	const keySelector = keySelection(values.CONVEX_DEPLOY_KEY);
	const selector = values.CONVEX_DEPLOYMENT || keySelector;
	const matched = /^(dev|prod|preview|anonymous|local):([a-z0-9-]+)$/.exec(selector);
	if (matched === null) { throw new Error("Configure CONVEX_DEPLOYMENT or a scoped CONVEX_DEPLOY_KEY."); }
	if (keySelector !== "" && selector !== keySelector) { throw new Error("CONVEX_DEPLOY_KEY conflicts with CONVEX_DEPLOYMENT."); }
	return { type: matched[1], name: matched[2] };
}

export function selectionVariables(envFile = ".env.local") {
	const file = readDotenv(envFile);
	const inherited = existsSync(envFile) ? undefined : process.env.CONVEX_DEPLOYMENT;
	const selected = file.CONVEX_DEPLOYMENT ?? inherited;
	return { ...file, CONVEX_DEPLOYMENT: selected, CONVEX_DEPLOY_KEY: file.CONVEX_DEPLOY_KEY ?? process.env.CONVEX_DEPLOY_KEY };
}

export function readDeploymentConnection(envFile = ".env.local") {
	const file = selectionVariables(envFile);
	const deployment = resolveDeployment(file);
	const apiUrl = file.VITE_CONVEX_URL ?? `https://${deployment.name}.convex.cloud`;
	const siteUrl = file.VITE_CONVEX_SITE_URL ?? `https://${deployment.name}.convex.site`;
	return { deployment, connection: validateConnection({ apiUrl, siteUrl }, deployment), hasDeployKey: Boolean(file.CONVEX_DEPLOY_KEY) };
}
