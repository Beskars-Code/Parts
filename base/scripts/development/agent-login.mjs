import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { applySetCookies, parseSetCookieHeader } from "better-auth/cookies";
import { ConvexHttpClient } from "convex/browser";

import { requireCloudDeployment } from "./cloud-deployment.mjs";
import { frontendEnvironment } from "./frontend-environment.mjs";
import { readEnvironment } from "./read-environment.mjs";
import { api } from "../../convex/_generated/api.js";

const SAME_SITE = { strict: "Strict", lax: "Lax", none: "None" };

function cookieExpiry(attributes) {
	const maxAge = attributes["max-age"];
	if (typeof maxAge === "number" && Number.isFinite(maxAge)) {
		return Math.floor(Date.now() / 1000) + maxAge;
	}
	const expires = attributes.expires;
	return expires instanceof Date && Number.isFinite(expires.getTime()) ? expires.getTime() / 1000 : -1;
}

function browserCookie(name, attributes, origin) {
	const originUrl = new URL(origin);
	return {
		name,
		value: encodeURIComponent(attributes.value),
		domain: attributes.domain ?? originUrl.hostname,
		path: attributes.path ?? "/",
		expires: cookieExpiry(attributes),
		httpOnly: Boolean(attributes.httponly),
		secure: Boolean(attributes.secure),
		sameSite: SAME_SITE[attributes.samesite] ?? "Lax",
	};
}

function browserCookies(headers, origin) {
	const cookies = new Map();
	for (const header of headers) {
		for (const [name, attributes] of parseSetCookieHeader(header)) {
			const cookie = browserCookie(name, attributes, origin);
			cookies.set(JSON.stringify([cookie.domain, cookie.path, cookie.name]), cookie);
		}
	}
	const now = Date.now() / 1000;
	return cookies
		.values()
		.filter((cookie) => cookie.expires === -1 || cookie.expires > now)
		.toArray();
}

async function request(url, options) {
	const response = await fetch(url, { ...options, redirect: "manual" });
	if (!response.ok) {
		throw new Error("The agent authentication request was denied.");
	}
	return response;
}

async function signIn(environment) {
	const origin = environment.SITE_URL;
	const response = await request(`${origin}/api/auth/cloud-agent-sign-in`, {
		method: "POST",
		headers: { Authorization: `Bearer ${environment.CLOUD_AGENT_AUTH_SECRET}`, Origin: origin },
	});
	const cookies = response.headers.getSetCookie();
	if (cookies.length === 0) {
		throw new Error("The agent endpoint did not issue a session cookie.");
	}
	const headers = new Headers({ Origin: origin });
	applySetCookies(headers, cookies);
	const tokenResponse = await request(`${origin}/api/auth/convex/token`, { headers });
	const body = await tokenResponse.json();
	if (typeof body?.token !== "string") {
		throw new TypeError("The authenticated endpoint did not return a Convex JWT.");
	}
	const tokenCookies = tokenResponse.headers.getSetCookie();
	applySetCookies(headers, tokenCookies);
	return { token: body.token, cookieHeader: headers.get("cookie"), cookies: [...cookies, ...tokenCookies] };
}

async function agentIdentity(environment, token) {
	const client = new ConvexHttpClient(environment.VITE_CONVEX_URL);
	client.setAuth(token);
	const identity = await client.query(api.auth.whoAmI, {});
	if (identity?.email !== "cloud-agent@localhost" || identity.role !== "admin") {
		throw new Error("The JWT did not authenticate the expected development admin.");
	}
	return identity;
}

async function main() {
	const loaded = readEnvironment();
	const deployment = requireCloudDeployment(loaded);
	const environment = frontendEnvironment(loaded);
	const cloudUrl = new URL(environment.VITE_CONVEX_URL);
	if (cloudUrl.protocol !== "https:" || cloudUrl.hostname !== `${deployment}.convex.cloud`) {
		throw new Error("The frontend URL does not match this agent's dev deployment key.");
	}
	if (environment.CLOUD_AGENT_AUTH_SECRET === undefined || environment.CLOUD_AGENT_AUTH_SECRET === "") {
		throw new Error("Configure CLOUD_AGENT_AUTH_SECRET for the isolated dev agent.");
	}
	const session = await signIn(environment);
	const identity = await agentIdentity(environment, session.token);
	const directory = mkdtempSync(path.join(tmpdir(), "parts-agent-"));
	const credentialsFile = path.join(directory, "credentials.json");
	const storageState = path.join(directory, "browser-state.json");
	writeFileSync(credentialsFile, JSON.stringify({ origin: environment.SITE_URL, convexUrl: environment.VITE_CONVEX_URL, cookieHeader: session.cookieHeader, token: session.token }), { mode: 0o600 });
	writeFileSync(storageState, JSON.stringify({ cookies: browserCookies(session.cookies, environment.SITE_URL), origins: [] }), { mode: 0o600 });
	console.log(JSON.stringify({ origin: environment.SITE_URL, email: identity.email, role: identity.role, credentialsFile, storageState }));
}

try {
	await main();
} catch {
	console.error("Agent login failed. Check the isolated dev deployment, matching frontend port, and agent-auth configuration. No credentials were printed.");
	process.exitCode = 1;
}
