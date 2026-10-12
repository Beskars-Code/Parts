import { readFile, realpath } from "node:fs/promises";
import path from "node:path";

import { executionEnvironment } from "../../environment/prepare-environment.mjs";
import { packageBinary, runBuildCommand } from "../command.mjs";
import { withPrivateJson } from "./private-json.mjs";

async function readConfig(file) {
	try {
		return JSON.parse(await readFile(file, "utf8"));
	} catch {
		throw new Error("Cloudflare configuration could not be read. Check the maintained module config and generated build outputs.");
	}
}

async function requireWorker(target) {
	const config = await readConfig("deployment/cloudflare/wrangler.json");
	const name = config.env?.[target]?.name;
	if (typeof name !== "string" || !/^[a-z0-9][a-z0-9-]{0,62}$/u.test(name) || name.startsWith("configure-")) {
		throw new Error(`Configure a destination-owned Worker name for env.${target} in deployment/cloudflare/wrangler.json.`);
	}
	return name;
}

function requireCredentials() {
	const { CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID } = process.env;
	if (!CLOUDFLARE_API_TOKEN) {
		throw new Error("Configure private CI CLOUDFLARE_API_TOKEN before publishing to Cloudflare.");
	}
	if (!/^[\da-f]{32}$/iu.test(CLOUDFLARE_ACCOUNT_ID ?? "")) {
		throw new Error("Configure the destination's explicit CLOUDFLARE_ACCOUNT_ID before publishing.");
	}
	return { CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID };
}

async function requireGeneratedConfig(workerName) {
	const redirectFile = path.resolve(".wrangler/deploy/config.json");
	const redirect = await readConfig(redirectFile);
	if (typeof redirect.configPath !== "string") {
		throw new TypeError("Cloudflare build did not emit its deployment configuration. Run the selected provider build first.");
	}
	const configPath = await realpath(path.resolve(path.dirname(redirectFile), redirect.configPath));
	const outputDirectory = await realpath("dist");
	const root = await realpath(".");
	if (!outputDirectory.startsWith(`${root}${path.sep}`) || !configPath.startsWith(`${outputDirectory}${path.sep}`)) {
		throw new Error("Cloudflare deployment configuration must refer to the current project's generated dist output.");
	}
	const config = await readConfig(configPath);
	if (config.name !== workerName) {
		throw new Error("The generated Worker name differs from the explicitly selected hosting target. Rebuild before publishing.");
	}
	await requireServerEntry(config, configPath, outputDirectory);
	return configPath;
}

async function requireServerEntry(config, configPath, outputDirectory) {
	if (typeof config.main !== "string") {
		throw new TypeError("Cloudflare build must contain the generated server entry for TanStack Start SSR.");
	}
	const entry = await realpath(path.resolve(path.dirname(configPath), config.main));
	if (!entry.startsWith(`${outputDirectory}${path.sep}`)) {
		throw new Error("Cloudflare server entry must belong to the current generated dist output.");
	}
}

async function preparePublish(bundle, target) {
	if (Object.keys(bundle.runtime).length > 100) {
		throw new Error("Cloudflare supports at most 100 secrets per version upload. Reduce the application bindings before publishing.");
	}
	const workerName = await requireWorker(target);
	const credentials = requireCredentials();
	const binary = await packageBinary("wrangler");
	return {
		requireBuild: () => requireGeneratedConfig(workerName),
		async publish(configPath) {
			await withPrivateJson(bundle.runtime, async file => {
				await runBuildCommand("Cloudflare Worker deployment", [binary, "deploy", "--config", configPath, "--secrets-file", file], executionEnvironment({
					...credentials, CI: "true", WRANGLER_SEND_METRICS: "false", CLOUDFLARE_LOAD_DEV_VARS_FROM_DOT_ENV: "false",
				}));
			});
		},
	};
}

export const cloudflare = {
	config: "deployment/cloudflare/vite.config.ts",
	outputPaths: ["dist", ".wrangler/deploy/config.json"],
	dependencies: { "@cloudflare/vite-plugin": "1.63.1", wrangler: "4.149.0" },
	buildEnvironment: target => ({ CLOUDFLARE_ENV: target, CLOUDFLARE_LOAD_DEV_VARS_FROM_DOT_ENV: "false" }),
	preparePublish,
};
