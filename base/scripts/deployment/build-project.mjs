import { clearProviderOutput } from "./build-output.mjs";
import { packageBinary, runBuildCommand } from "./command.mjs";
import { executionEnvironment } from "../environment/prepare-environment.mjs";
import { runConvex } from "../environment/process.mjs";

export async function generateBuildSources(bundle, envFile) {
	const environment = executionEnvironment(bundle.runtime);
	await runBuildCommand("Auth schema generation", ["scripts/development/generate-auth-schema.mjs"], environment);
	await runBuildCommand("Confect generation", ["scripts/development/confect.mjs", "codegen"], environment);
	await runConvex(["codegen", "--typecheck", "enable"], { envFile });
}

export async function compileProject(bundle, provider, target) {
	const vite = await packageBinary("vite");
	const args = [vite, "build"];
	if (provider !== undefined) {
		await clearProviderOutput(provider);
		args.push("--config", provider.config);
	}
	const environment = executionEnvironment({
		...bundle.runtime,
		NODE_ENV: "production",
		...provider?.buildEnvironment(target),
	});
	await runBuildCommand("Vite build", args, environment);
}
