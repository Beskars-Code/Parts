export function requireCloudDeployment(environment) {
	const match = /^dev:([a-z0-9-]+)\|[^\s]+$/.exec(environment.CONVEX_DEPLOY_KEY ?? "");
	if (match === null) {
		throw new Error("Configure a deployment-scoped dev CONVEX_DEPLOY_KEY for this agent.");
	}
	if (environment.CONVEX_AGENT_MODE) {
		throw new Error("Cloud agents must not set CONVEX_AGENT_MODE.");
	}
	return match[1];
}
