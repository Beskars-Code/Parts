import { readDeploymentArguments } from "./arguments.mjs";
import { compileProject, generateBuildSources } from "./build-project.mjs";
import { requireDeployTarget } from "./deploy-target.mjs";
import { requireProvider } from "./provider-registry.mjs";
import { prepareEnvironment } from "../environment/prepare-environment.mjs";
import { runConvex } from "../environment/process.mjs";

async function deploy() {
	const options = readDeploymentArguments(true);
	const connection = await requireDeployTarget(options.envFile, options.target);
	const bundle = await prepareEnvironment({ source: "convex", envFile: options.envFile, connection });
	const provider = await requireProvider(options.provider);
	const publishing = await provider.preparePublish(bundle, options.target);
	await generateBuildSources(bundle, options.envFile);
	await compileProject(bundle, provider, options.target);
	const output = await publishing.requireBuild();
	await runConvex(["deploy", "--yes"], { envFile: options.envFile });
	await publishing.publish(output);
	console.log(`Published the explicitly selected ${options.target} application and Convex backend.`);
}

try {
	await deploy();
} catch (error) {
	console.error(error.message);
	process.exitCode = 1;
}
