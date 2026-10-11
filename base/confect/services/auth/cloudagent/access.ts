import { APIError } from "better-auth/api";
import * as Config from "effect/Config";
import * as Effect from "effect/Effect";
import * as Option from "effect/Option";

const LOOPBACK_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]"]);

function parseUrl(siteUrl: string): URL | null {
	try {
		return new URL(siteUrl);
	} catch {
		return null;
	}
}

function isLocalSite(siteUrl: string | undefined): boolean {
	if (siteUrl === undefined) {
		return false;
	}
	const url = parseUrl(siteUrl);
	return url?.protocol === "http:" && LOOPBACK_HOSTS.has(url.hostname) && url.href === `${url.origin}/`;
}

function bearerSecret(headers: Headers | undefined): string {
	const match = /^Bearer (.+)$/i.exec(headers?.get("authorization") ?? "");
	return match?.[1] ?? "";
}

const secretsMatch = Effect.fnUntraced(function* (presented: string, stored: string) {
	const encoder = new TextEncoder();
	const [presentedDigest, storedDigest] = yield* Effect.all(
		[Effect.promise(() => crypto.subtle.digest("SHA-256", encoder.encode(presented))), Effect.promise(() => crypto.subtle.digest("SHA-256", encoder.encode(stored)))],
		{ concurrency: "unbounded" },
	);
	const left = new Uint8Array(presentedDigest);
	const right = new Uint8Array(storedDigest);
	let mismatch = 0;
	for (const [index, byte] of left.entries()) {
		mismatch |= byte ^ (right[index] ?? 0);
	}
	return mismatch === 0;
});

const requireDevelopmentDeployment = Effect.gen(function* () {
	const env = yield* Config.option(Config.String("ENV"));
	if (Option.getOrUndefined(env) !== "dev") {
		return yield* Effect.fail(new APIError("UNAUTHORIZED"));
	}
	const siteUrl = yield* Config.option(Config.String("SITE_URL"));
	if (!siteUrl.pipe(Option.getOrUndefined, isLocalSite)) {
		return yield* Effect.fail(new APIError("UNAUTHORIZED"));
	}
});

const requireDevelopmentSecret = Effect.gen(function* () {
	yield* requireDevelopmentDeployment;
	const secretOption = yield* Config.option(Config.String("CLOUD_AGENT_AUTH_SECRET"));
	const secret = Option.getOrUndefined(secretOption);
	return yield* secret === undefined || secret === "" ? Effect.fail(new APIError("UNAUTHORIZED")) : Effect.succeed(secret);
});

export const assertCloudAgentAccess = Effect.fnUntraced(function* (headers: Headers | undefined) {
	const secret = yield* requireDevelopmentSecret;
	if (!(yield* secretsMatch(bearerSecret(headers), secret))) {
		return yield* Effect.fail(new APIError("UNAUTHORIZED"));
	}
});
