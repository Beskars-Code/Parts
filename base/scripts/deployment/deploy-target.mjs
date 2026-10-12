import { readDeploymentConnection } from "../environment/prepare-environment.mjs";

export async function requireDeployTarget(envFile, target) {
	const selected = await readDeploymentConnection(envFile);
	const allowedTypes = target === "production" ? ["prod"] : ["prod", "dev", "preview"];
	if (!allowedTypes.includes(selected.deployment.type)) {
		throw new Error(`The ${target} hosting target requires an explicit scoped cloud Convex deployment selection.`);
	}
	if (!selected.hasDeployKey) {
		throw new Error("Publishing requires a matching private CONVEX_DEPLOY_KEY for the explicitly selected deployment.");
	}
	return selected.connection;
}
