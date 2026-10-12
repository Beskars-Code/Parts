import { parseArgs } from "node:util";

function requirePublishArguments(values) {
	if (!["staging", "production"].includes(values.target)) {
		throw new Error("Deploy requires --target staging or --target production.");
	}
	if (values.provider === undefined || values["env-file"] === undefined) {
		throw new Error("Deploy requires --provider and an explicit --env-file selecting its Convex deployment.");
	}
}

export function readDeploymentArguments(isDeploy = false) {
	const { values } = parseArgs({
		options: {
			provider: { type: "string" },
			"env-file": { type: "string" },
			target: { type: "string" },
		},
		strict: true,
		allowPositionals: false,
	});
	if (isDeploy) {
		requirePublishArguments(values);
	} else if (values.target !== undefined) {
		throw new Error("Build does not select a publishing target. Use an explicit deploy command to publish.");
	}
	return { provider: values.provider, envFile: values["env-file"] ?? ".env.local", target: values.target };
}
