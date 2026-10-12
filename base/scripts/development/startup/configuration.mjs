import { existsSync, readFileSync } from "node:fs";

import { appVariables } from "../../environment/catalog.mjs";
import { readDeploymentConnection, resolveDeployment, selectionVariables, validateConnection } from "../../environment/connection.mjs";
import { seedConvexVariables } from "../../environment/convex.mjs";
import { mergeAppDotenv, readDotenv, serializeDotenv, writeDotenv, writeFileAtomic } from "../../environment/dotenv.mjs";
import { executionEnvironment, prepareEnvironment } from "../../environment/prepare-environment.mjs";
import { frontendPort } from "../frontend-environment.mjs";

const primary = ".env.local";
const cloud = ".env.cloud.local";
const anonymous = ".env.anonymous.local";

export function startupMode(argv) {
	const [first, ...rest] = argv;
	return first === "cloud" || first === "anonymous" ? { mode: first, argv: rest } : { mode: "active", argv };
}

function cloudSource() {
	const selected = readDotenv(primary).CONVEX_DEPLOYMENT ?? "";
	return /^(anonymous|local):/.test(selected) ? cloud : primary;
}

function localConnection(values, options) {
	const configured = validateConnection({ apiUrl: values.VITE_CONVEX_URL ?? "http://127.0.0.1:3210", siteUrl: values.VITE_CONVEX_SITE_URL ?? "http://127.0.0.1:3211" }, { type: "anonymous" });
	const api = new URL(configured.apiUrl);
	const site = new URL(configured.siteUrl);
	api.port = options.cloudPort ?? api.port;
	site.port = options.sitePort ?? site.port;
	return validateConnection({ apiUrl: api.origin, siteUrl: site.origin }, { type: "anonymous" });
}

function anonymousSelection(options) {
	if (!existsSync(primary)) { throw new Error("dev:anonymous requires .env.local with SITE_URL and BETTER_AUTH_SECRET app seeds."); }
	const cached = readDotenv(anonymous);
	const deployment = resolveDeployment({ CONVEX_DEPLOYMENT: cached.CONVEX_DEPLOYMENT ?? "anonymous:anonymous-agent" });
	if (deployment.type !== "anonymous") { throw new Error("The anonymous configuration must select an anonymous deployment."); }
	return { deployment, connection: localConnection(cached, options), envFile: primary, isLocal: true };
}

function existingSelection(envFile, options) {
	const selected = readDeploymentConnection(envFile);
	if (!["dev", "anonymous", "local"].includes(selected.deployment.type)) { throw new Error("Development commands require a dev, local, or anonymous deployment."); }
	const isLocal = selected.deployment.type !== "dev";
	const connection = isLocal ? localConnection(readDotenv(envFile), options) : selected.connection;
	return { ...selected, connection, envFile, isLocal };
}

export function selectedConfiguration(mode, options) {
	if (mode === "anonymous") { return anonymousSelection(options); }
	const selected = existingSelection(mode === "cloud" ? cloudSource() : primary, options);
	if (mode === "cloud" && selected.deployment.type !== "dev") { throw new Error("dev:cloud requires a selected cloud dev deployment."); }
	return selected;
}

function frontendSite(bundle, port) {
	const url = new URL(bundle.runtime.SITE_URL);
	if (url.protocol !== "http:" || !["localhost", "127.0.0.1", "[::1]"].includes(url.hostname) || url.port !== port) {
		throw new Error("SITE_URL must be an HTTP loopback origin using the development PORT.");
	}
}

function convexEnvironment(selected, environment) {
	const controls = { CONVEX_DEPLOYMENT: `${selected.deployment.type}:${selected.deployment.name}` };
	if (selected.deployment.type === "anonymous") { controls.CONVEX_AGENT_MODE = "anonymous"; }
	if (!selected.isLocal) {
		const key = selectionVariables(selected.envFile).CONVEX_DEPLOY_KEY;
		if (key) { controls.CONVEX_DEPLOY_KEY = key; }
	}
	return { ...environment, ...controls };
}

function preserveCloud(original) {
	const selected = readDotenv(primary).CONVEX_DEPLOYMENT ?? "";
	if (selected.startsWith("dev:")) { writeFileAtomic(cloud, original); }
}

function activate(selected, bundle, original) {
	const metadata = {
		CONVEX_DEPLOYMENT: `${selected.deployment.type}:${selected.deployment.name}`,
		VITE_CONVEX_URL: selected.connection.apiUrl,
		VITE_CONVEX_SITE_URL: selected.connection.siteUrl,
	};
	if (selected.isLocal) {
		preserveCloud(original);
		writeDotenv(primary, { ...metadata, ...bundle.runtime });
		return;
	}
	mergeAppDotenv(primary, bundle.runtime, metadata, selected.envFile);
	writeFileAtomic(cloud, readFileSync(primary));
}

function archiveConfiguration(selected) {
	if (selected.deployment.type === "local") { return; }
	const archive = selected.isLocal ? anonymous : cloud;
	if (existsSync(primary)) { writeFileAtomic(archive, readFileSync(primary)); }
}

function restoreConfiguration(selected, original) {
	try {
		archiveConfiguration(selected);
	} finally {
		if (selected.isLocal) { writeFileAtomic(primary, original); }
	}
}

function activateEnvironment(selected, bundle, original, port) {
	try {
		activate(selected, bundle, original);
		const environment = executionEnvironment({ ...bundle.runtime, PORT: port });
		return { environment, convexEnvironment: convexEnvironment(selected, environment) };
	} catch (error) {
		if (selected.isLocal) { writeFileAtomic(primary, original); }
		throw error;
	}
}

export async function prepareStartup(selected, signal) {
	const original = existsSync(primary) ? readFileSync(primary) : undefined;
	const bundle = await prepareEnvironment({ source: selected.isLocal ? "dotenv" : "convex", envFile: selected.envFile, connection: selected.connection, signal });
	const port = frontendPort(process.env.PORT);
	frontendSite(bundle, port);
	serializeDotenv(bundle.runtime);
	if (original === undefined && selected.isLocal) { throw new Error("Local startup requires .env.local app seeds."); }
	signal.throwIfAborted();
	const environments = activateEnvironment(selected, bundle, original, port);
	return {
		...environments,
		async seed() { if (selected.isLocal) { await seedConvexVariables(primary, appVariables(bundle.runtime), signal); } },
		restore() { restoreConfiguration(selected, original); },
	};
}
