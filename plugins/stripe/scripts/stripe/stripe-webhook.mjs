// Registers (or checks) the Convex Stripe webhook endpoint and stores its signing secret.
// Ported from Apollo-Labs scripts/stripe-webhook.ts minus the Stripe CLI listen mode.
import { STRIPE_API_VERSION, WEBHOOK_EVENT_TYPES, convexEnvGet, convexEnvSet, createStripeClient, requireStripeSecretKey, siteUrl } from "./environment.mjs";

const hasMatchingEvents = (endpoint) => {
	const current = new Set(endpoint.enabled_events);
	return WEBHOOK_EVENT_TYPES.length === current.size && WEBHOOK_EVENT_TYPES.every((event) => current.has(event));
};

const endpointsForUrl = async (ctx) => {
	const listed = await ctx.stripe.webhookEndpoints.list({ limit: 100 });
	return listed.data.filter((endpoint) => endpoint.url === ctx.url);
};

const eventDrift = (endpoint) => {
	if (hasMatchingEvents(endpoint)) {
		return;
	}
	const enabled = endpoint.enabled_events ?? [];
	const missing = WEBHOOK_EVENT_TYPES.filter((event) => !enabled.includes(event));
	const extra = enabled.filter((event) => !WEBHOOK_EVENT_TYPES.includes(event));
	const parts = [`mismatched_events: ${endpoint.id}`];
	if (missing.length > 0) {
		parts.push(`missing ${missing.join(",")}`);
	}
	if (extra.length > 0) {
		parts.push(`extra ${extra.join(",")}`);
	}
	return parts.join(" ");
};

const apiVersionDrift = (endpoint) => (endpoint.api_version === STRIPE_API_VERSION ? undefined : `mismatched_api_version: ${endpoint.id} (${endpoint.api_version ?? "account default"}; expected ${STRIPE_API_VERSION})`);

const checkDrifts = async (ctx) => {
	const existing = await endpointsForUrl(ctx);
	const endpointDrifts = existing.flatMap((endpoint) => [apiVersionDrift(endpoint), eventDrift(endpoint)]).filter((drift) => drift !== undefined);
	const drifts = existing.length === 0 ? [`missing_endpoint: ${ctx.url}`, ...endpointDrifts] : endpointDrifts;
	if (convexEnvGet("STRIPE_WEBHOOK_SECRET") === undefined) {
		drifts.push("missing_env: STRIPE_WEBHOOK_SECRET not set on the deployment");
	}
	return { drifts, count: existing.length };
};

const runCheck = async (ctx) => {
	const { drifts, count } = await checkDrifts(ctx);
	if (drifts.length === 0) {
		console.log(`in sync (${count} endpoint(s) at ${ctx.url}, API ${STRIPE_API_VERSION}, events match, STRIPE_WEBHOOK_SECRET set)`);
		return;
	}
	console.log(drifts.join("\n"));
	process.exitCode = 1;
};

const reconcileEndpoint = async (ctx, endpoint, isSecretSet) => {
	if (!isSecretSet) {
		await ctx.stripe.webhookEndpoints.del(endpoint.id);
		console.log(`removed endpoint ${endpoint.id} (secret cannot be re-read; recreating)`);
		return;
	}
	if (hasMatchingEvents(endpoint)) {
		console.log(`in sync (${endpoint.id} at ${ctx.url})`);
		return;
	}
	await ctx.stripe.webhookEndpoints.update(endpoint.id, { enabled_events: [...WEBHOOK_EVENT_TYPES] });
	console.log(`updated events on ${endpoint.id}`);
};

const createEndpoint = async (ctx) => {
	const created = await ctx.stripe.webhookEndpoints.create({
		url: ctx.url,
		enabled_events: [...WEBHOOK_EVENT_TYPES],
		api_version: STRIPE_API_VERSION,
		description: "Apollo Predictions Convex HTTP webhook",
	});
	if (!created.secret) {
		throw new Error("Stripe did not return a webhook signing secret");
	}
	convexEnvSet("STRIPE_WEBHOOK_SECRET", created.secret);
	console.log(`created ${created.id} at ${ctx.url}`);
	console.log("stored STRIPE_WEBHOOK_SECRET");
};

const applySetup = async (ctx) => {
	const isSecretSet = convexEnvGet("STRIPE_WEBHOOK_SECRET") !== undefined;
	const existing = await endpointsForUrl(ctx);
	const versionDrifts = existing.map((endpoint) => apiVersionDrift(endpoint)).filter((drift) => drift !== undefined);
	if (versionDrifts.length > 0) {
		throw new Error(`${versionDrifts.join("\n")}. Migrate these endpoints using Stripe's webhook versioning procedure before rerunning setup.`);
	}
	for (const endpoint of existing) {
		await reconcileEndpoint(ctx, endpoint, isSecretSet);
	}
	const remaining = await endpointsForUrl(ctx);
	if (remaining.length > 0) {
		return;
	}
	await createEndpoint(ctx);
};

const run = async () => {
	const flags = new Set(process.argv.slice(2));
	const ctx = {
		stripe: createStripeClient(requireStripeSecretKey({ allowLive: flags.has("--allow-live") })),
		url: `${siteUrl()}/stripe/webhook`,
	};
	if (flags.has("--check")) {
		await runCheck(ctx);
		return;
	}
	await applySetup(ctx);
};

try {
	await run();
} catch (error) {
	console.error(Error.isError(error) ? error.message : String(error));
	process.exitCode = 1;
}
