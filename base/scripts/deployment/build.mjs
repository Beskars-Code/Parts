import { readDeploymentArguments } from "./arguments.mjs";
import { compileProject, generateBuildSources } from "./build-project.mjs";
import { requireProvider } from "./provider-registry.mjs";
import { prepareEnvironment, readDeploymentConnection } from "../environment/prepare-environment.mjs";

async function build() {
	const options = readDeploymentArguments();
	const { connection } = await readDeploymentConnection(options.envFile);
	const bundle = await prepareEnvironment({ source: "convex", envFile: options.envFile, connection });
	const provider = await requireProvider(options.provider);
	await generateBuildSources(bundle, options.envFile);
	await compileProject(bundle, provider, "development");
	console.log("Validated application environment and built the selected server/client output. No deployment was published.");
}

try {
	await build();
} catch (error) {
	console.error(error.message);
	process.exitCode = 1;
}
