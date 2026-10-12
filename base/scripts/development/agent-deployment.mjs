import { resolveDeployment } from "../environment/connection.mjs";

const LOOPBACK_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]"]);

function requireLocalUrl(value) {
	const url = new URL(value);
	if (url.protocol !== "http:" || !LOOPBACK_HOSTS.has(url.hostname) || url.href !== `${url.origin}/`) {
		throw new Error("Local agent login requires HTTP loopback Convex API and site URLs without paths.");
	}
	return url;
}

function requireCloudUrl(value, deploymentName) {
	const url = new URL(value);
	if (url.origin !== `https://${deploymentName}.convex.cloud` || url.href !== `${url.origin}/`) {
		throw new Error("The configured Convex URL does not match the selected cloud dev deployment.");
	}
}

function requireDevelopmentTarget(environment) {
	const target = resolveDeployment(environment);
	if (!["dev", "anonymous", "local"].includes(target.type)) {
		throw new Error("Select a development deployment with `bun run dev:convex` first, then configure backend SITE_URL and BETTER_AUTH_SECRET.");
	}
	return target;
}

export function requireAgentDeployment(environment) {
	if (environment.CONVEX_AGENT_MODE) {
		throw new Error("Agent login must not set CONVEX_AGENT_MODE.");
	}
	const target = requireDevelopmentTarget(environment);
	if (target.type === "dev") {
		requireCloudUrl(environment.VITE_CONVEX_URL, target.name);
		return;
	}
	requireLocalUrl(environment.VITE_CONVEX_URL);
	requireLocalUrl(environment.VITE_CONVEX_SITE_URL);
}

