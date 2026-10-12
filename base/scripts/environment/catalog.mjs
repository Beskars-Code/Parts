const requiredAppKeys = ["SITE_URL", "BETTER_AUTH_SECRET"];

const controlKeys = new Set([
	"PORT", "NODE_ENV", "NODE_OPTIONS", "BUN_OPTIONS", "VERCEL_TOKEN", "VERCEL_ORG_ID", "VERCEL_PROJECT_ID",
	"CLOUDFLARE_API_TOKEN", "CLOUDFLARE_API_KEY", "CLOUDFLARE_ACCOUNT_ID", "CF_API_TOKEN", "CF_ACCOUNT_ID", "CLOUDFLARE_ENV",
]);
const connectionPrefixes = ["CONVEX_", "NEXT_PUBLIC_CONVEX_", "NEXT_CONVEX_", "PUBLIC_CONVEX_", "VITE_CONVEX_", "REACT_APP_CONVEX_", "EXPO_PUBLIC_CONVEX_"];

export function validateName(name) {
	if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(name)) { throw new Error("An environment variable has an invalid name."); }
	return name;
}

export function isAppKey(name) {
	return !controlKeys.has(name) && connectionPrefixes.every(prefix => !name.startsWith(prefix));
}

export function isPublicKey(name) {
	return ["NEXT_", "PUBLIC_", "VITE_"].some(prefix => name.startsWith(prefix));
}

export function appVariables(values) {
	return Object.fromEntries(Object.entries(values).filter(([name]) => isAppKey(name)));
}

export function validateRequired(values) {
	for (const name of requiredAppKeys) {
		if (typeof values[name] !== "string" || values[name].length === 0) { throw new Error(`Missing required environment variable ${name}.`); }
	}
	validateSite(values.SITE_URL);
}

function validateSite(value) {
	let site;
	try { site = new URL(value); } catch { throw new Error("Invalid environment variable SITE_URL."); }
	if (!["http:", "https:"].includes(site.protocol) || site.href !== `${site.origin}/`) { throw new Error("Invalid environment variable SITE_URL."); }
}
