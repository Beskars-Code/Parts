import { access, readFile, readdir } from "node:fs/promises";

import { executionEnvironment } from "../../environment/prepare-environment.mjs";
import { packageBinary, runBuildCommand } from "../command.mjs";

function requireIdentity(name, pattern) {
	const value = process.env[name];
	if (!pattern.test(value ?? "") || value.includes("configure")) {
		throw new Error(`Configure the destination's explicit ${name} before publishing.`);
	}
	return value;
}

function requireCredentials() {
	const { VERCEL_TOKEN } = process.env;
	if (!VERCEL_TOKEN) {
		throw new Error("Configure private CI VERCEL_TOKEN before publishing to Vercel.");
	}
	return { VERCEL_TOKEN, VERCEL_PROJECT_ID: requireIdentity("VERCEL_PROJECT_ID", /^prj_[\w-]+$/u), VERCEL_ORG_ID: requireIdentity("VERCEL_ORG_ID", /^team_[\w-]+$/u) };
}

async function requireUpdatedVariable(response, key) {
	if (!response.ok) {
		throw new Error(`Vercel environment update failed for ${key} (HTTP ${response.status}). Provider response values were withheld.`);
	}
	let result;
	try {
		result = await response.json();
	} catch {
		throw new Error(`Vercel returned an invalid environment response for ${key}. Provider response values were withheld.`);
	}
	if (!Array.isArray(result.failed) || result.failed.length > 0) {
		throw new Error(`Vercel refused the environment update for ${key}. Provider response values were withheld.`);
	}
}

async function upsertVariable(credentials, target, key, value, isPublic) {
	const url = new URL(`https://api.vercel.com/v10/projects/${encodeURIComponent(credentials.VERCEL_PROJECT_ID)}/env`);
	url.searchParams.set("teamId", credentials.VERCEL_ORG_ID);
	url.searchParams.set("upsert", "true");
	const body = JSON.stringify({ key, value, type: isPublic ? "plain" : "encrypted", target: [target] });
	let response;
	try {
		response = await fetch(url, {
			method: "POST",
			redirect: "error",
			headers: { Authorization: `Bearer ${credentials.VERCEL_TOKEN}`, "Content-Type": "application/json" },
			body,
			signal: AbortSignal.timeout(30_000),
		});
	} catch {
		throw new Error(`Vercel environment update failed for ${key}; check the private token and selected project/team.`);
	}
	await requireUpdatedVariable(response, key);
}

async function preparePublish(bundle, target) {
	const credentials = requireCredentials();
	await access("deployment/vercel/vercel.json");
	const binary = await packageBinary("vercel");
	const environment = target === "production" ? "production" : "preview";
	return {
		requireBuild: requireServerOutput,
		async publish() {
			for (const [key, value] of Object.entries(bundle.runtime)) {
				await upsertVariable(credentials, environment, key, value, Object.hasOwn(bundle.public, key));
			}
			await runBuildCommand("Vercel prebuilt deployment", [
				binary, "deploy", "--prebuilt", "--yes", "--force", "--target", environment,
				"--project", credentials.VERCEL_PROJECT_ID, "--scope", credentials.VERCEL_ORG_ID,
				"--local-config", "deployment/vercel/vercel.json",
			], executionEnvironment({ ...credentials, VERCEL_TELEMETRY_DISABLED: "1" }));
		},
	};
}

async function requireServerOutput() {
	let config;
	let functions;
	try {
		config = JSON.parse(await readFile(".vercel/output/config.json", "utf8"));
		functions = await readdir(".vercel/output/functions");
	} catch {
		throw new Error("The Vercel build must emit Build Output API configuration and an SSR function before publishing.");
	}
	if (config.version !== 3 || functions.length === 0) {
		throw new Error("The Vercel build must contain version-3 Build Output API artifacts and an SSR function.");
	}
}

export const vercel = {
	config: "deployment/vercel/vite.config.ts",
	outputPaths: [".vercel/output"],
	dependencies: { nitro: "3.0.260903-beta", vercel: "59.11.7" },
	buildEnvironment: target => ({ VERCEL_ENV: target === "production" ? "production" : "preview" }),
	preparePublish,
};

