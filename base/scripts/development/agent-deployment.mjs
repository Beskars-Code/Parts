const LOOPBACK_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]"]);

export function requireLocalUrl(value) {
	const url = new URL(value);
	if (url.protocol !== "http:" || !LOOPBACK_HOSTS.has(url.hostname) || url.href !== `${url.origin}/`) {
		throw new Error("Local agent login requires HTTP loopback Convex API and site URLs without paths.");
	}
}

export function requireCloudUrl(value, deploymentName) {
	const url = new URL(value);
	if (url.protocol !== "https:" || url.hostname !== `${deploymentName}.convex.cloud` || url.href !== `${url.origin}/`) {
		throw new Error("The configured Convex URL does not match the selected cloud dev deployment.");
	}
}

function cloudTarget(environment, selected) {
	const match = /^dev:([a-z0-9-]+)\|[^\s]+$/.exec(environment.CONVEX_DEPLOY_KEY ?? "");
	if (match === null) {
		throw new Error("CONVEX_DEPLOY_KEY must be a deployment-scoped dev key for development commands.");
	}
	if (selected !== "" && selected !== `dev:${match[1]}`) {
		throw new Error("CONVEX_DEPLOY_KEY conflicts with CONVEX_DEPLOYMENT. Clear the cloud key for local development or select its matching cloud dev deployment.");
	}
	return { type: "dev", name: match[1] };
}

export function requireDevelopmentTarget(environment) {
	const selected = environment.CONVEX_DEPLOYMENT ?? "";
	if (environment.CONVEX_DEPLOY_KEY) { return cloudTarget(environment, selected); }
	const match = /^(anonymous|local|dev):([a-z0-9-]+)$/.exec(selected);
	if (match === null) {
		throw new Error("Select a development deployment with `bun run dev:convex` first, then configure backend SITE_URL and BETTER_AUTH_SECRET.");
	}
	return { type: match[1], name: match[2] };
}

export function requireAgentDeployment(environment) {
	if (environment.CONVEX_AGENT_MODE) {
		throw new Error("Agent login must not set CONVEX_AGENT_MODE.");
	}
	const target = requireDevelopmentTarget(environment);
	if (target.type === "dev") {
		if (!environment.CONVEX_DEPLOY_KEY) {
			throw new Error("Configure a deployment-scoped dev CONVEX_DEPLOY_KEY for cloud agent login.");
		}
		requireCloudUrl(environment.VITE_CONVEX_URL, target.name);
		return;
	}
	requireLocalUrl(environment.VITE_CONVEX_URL);
	requireLocalUrl(environment.VITE_CONVEX_SITE_URL);
}
