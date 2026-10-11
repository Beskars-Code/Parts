import { spawnSync } from "node:child_process";

import StripeSdk from "stripe";

import { STRIPE_API_VERSION } from "../../confect/stripe/provider/apiversion.ts";
import { readEnvironment } from "../development/read-environment.mjs";

export { STRIPE_API_VERSION } from "../../confect/stripe/provider/apiversion.ts";
export { WEBHOOK_EVENT_TYPES } from "../../confect/stripe/provider/webhookevents.ts";

const isNoiseLine = (line) => {
	const trimmed = line.trimStart();
	return trimmed === "" || trimmed.startsWith("npm ") || trimmed.startsWith("Done in");
};

export function convexEnvGet(name) {
	const result = spawnSync("bun", ["--bun", "run", "convex", "env", "get", name], {
		encoding: "utf8",
		stdio: ["ignore", "pipe", "pipe"],
		env: process.env,
	});
	if (result.status !== 0) {
		return;
	}
	const last = result.stdout.split("\n").findLast((line) => !isNoiseLine(line));
	return last?.trim();
}

export function convexEnvSet(name, value) {
	const result = spawnSync("bun", ["--bun", "run", "convex", "env", "set", name, value], {
		encoding: "utf8",
		stdio: ["ignore", "pipe", "pipe"],
		env: process.env,
	});
	if (result.status === 0) {
		return;
	}
	const detail = (result.stderr || result.stdout || "").trim();
	throw new Error(`convex env set ${name} failed${detail ? `: ${detail}` : ""}`);
}

function cleanCliStdout(stdout) {
	return stdout
		.split("\n")
		.filter((line) => !isNoiseLine(line))
		.join("\n")
		.trim();
}

function extractJsonText(cleaned) {
	const objectStart = cleaned.indexOf("{");
	const arrayStart = cleaned.indexOf("[");
	const candidates = [objectStart, arrayStart].filter((index) => index >= 0);
	const start = candidates.length > 0 ? Math.min(...candidates) : -1;
	if (start < 0) {
		return;
	}
	const closer = cleaned[start] === "[" ? "]" : "}";
	const end = cleaned.lastIndexOf(closer);
	return end > start ? cleaned.slice(start, end + 1) : undefined;
}

const SCALARS = { null: null, true: true, false: false };

function lastContentLine(cleaned) {
	const line = cleaned.split("\n").findLast((entry) => entry.trim() !== "");
	return line?.trim() ?? "";
}

function parseScalar(cleaned) {
	if (cleaned === "") {
		return;
	}
	const quoted = cleaned.match(/"([^"\\]+)"\s*$/);
	if (quoted?.[1] !== undefined) {
		return quoted[1];
	}
	const last = lastContentLine(cleaned);
	if (Object.hasOwn(SCALARS, last)) {
		return SCALARS[last];
	}
	throw new Error(`Could not parse convex run output: ${cleaned.slice(0, 200)}`);
}

function parseConvexCliJson(stdout) {
	const cleaned = cleanCliStdout(stdout);
	const json = extractJsonText(cleaned);
	return json === undefined ? parseScalar(cleaned) : JSON.parse(json);
}

export function convexRun(functionName, args = {}) {
	const result = spawnSync("bun", ["--bun", "run", "convex", "run", functionName, JSON.stringify(args)], {
		encoding: "utf8",
		stdio: ["ignore", "pipe", "pipe"],
		env: process.env,
	});
	if (result.status !== 0) {
		const detail = (result.stderr || result.stdout || `convex run ${functionName} failed`).trim();
		throw new Error(detail);
	}
	return parseConvexCliJson(result.stdout);
}

const isTestKey = (key) => key.startsWith("sk_test_") || key.startsWith("rk_test_");

function missingKeyError() {
	throw new Error("STRIPE_SECRET_KEY is not set on the Convex deployment (bun --bun run convex env set STRIPE_SECRET_KEY ...)");
}

function assertTestKey(key, allowLive) {
	if (!allowLive && !isTestKey(key)) {
		throw new Error("Refusing to run against a non-test Stripe key. Pass --allow-live to override.");
	}
}

export function requireStripeSecretKey({ allowLive = false } = {}) {
	const key = convexEnvGet("STRIPE_SECRET_KEY") ?? "";
	if (key === "") {
		missingKeyError();
	}
	assertTestKey(key, allowLive);
	return key;
}

export function createStripeClient(key) {
	return new StripeSdk(key, { apiVersion: STRIPE_API_VERSION });
}

export function siteUrl() {
	const local = readEnvironment();
	const value = local.VITE_CONVEX_SITE_URL || local.CONVEX_SITE_URL || convexEnvGet("VITE_CONVEX_SITE_URL") || convexEnvGet("CONVEX_SITE_URL");
	if (!value) {
		throw new Error("VITE_CONVEX_SITE_URL / CONVEX_SITE_URL is not set");
	}
	return value.replace(/\/$/, "");
}
