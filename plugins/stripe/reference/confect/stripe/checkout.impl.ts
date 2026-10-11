import * as FunctionImpl from "@confect/server/FunctionImpl";
import * as GroupImpl from "@confect/server/GroupImpl";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

import checkout from "./checkout.spec.ts";
import { stripe } from "./provider/config";
import refs from "../_generated/refs";
import databaseSchema from "../_generated/schema";
import { MutationRunner, QueryRunner } from "../_generated/services";
import RequireUser from "../middleware/requireuser.impl";
import { CurrentUser } from "../middleware/requireuser.spec";
import telemetryMiddleware from "../middleware/telemetry.impl";
import { FORECASTER_PRODUCT_LOOKUP_KEY } from "../services/billing/catalog";

const siteUrl = (): string => {
	const base = process.env["SITE_URL"];
	if (base === undefined || base === "") {
		throw new Error("SITE_URL is not defined in environment variables");
	}
	return base.replace(/\/$/, "");
};

const UNSAFE_PATH_PARTS = ["//", "://", "\\", "\n", "\r"];

const safeReturnPath = (returnPath: string | undefined): string => {
	if (returnPath === undefined || returnPath === "") {
		return "/";
	}
	if (!returnPath.startsWith("/") || UNSAFE_PATH_PARTS.some((part) => returnPath.includes(part))) {
		throw new Error("Return path must be a relative path on this site");
	}
	return returnPath;
};

const resolveStripeCustomer = Effect.fnUntraced(function* () {
	const { user } = yield* CurrentUser;
	const queryRunner = yield* QueryRunner;
	const details = yield* queryRunner.runQuery(refs.public.data.userdetails.query.getMe, {}).pipe(Effect.orDie);
	if (details === null) {
		return yield* Effect.die(new Error("User profile not found"));
	}
	if (details.stripeCustomerId !== undefined && details.stripeCustomerId !== "") {
		return { stripeCustomerId: details.stripeCustomerId, userDetailsId: details._id };
	}
	const customer = yield* Effect.promise(() => stripe().customers.create({ email: user.email, name: user.name }));
	const mutationRunner = yield* MutationRunner;
	yield* mutationRunner
		.runMutation(refs.internal.stripe.sync.setStripeCustomerId, {
			userDetailsId: details._id,
			stripeCustomerId: customer.id,
		})
		.pipe(Effect.orDie);
	return { stripeCustomerId: customer.id, userDetailsId: details._id };
});

const checkoutSession = FunctionImpl.make(
	databaseSchema,
	checkout,
	"createCheckoutSession",
	Effect.fnUntraced(function* ({ returnPath }) {
		const queryRunner = yield* QueryRunner;
		const price = yield* queryRunner.runQuery(refs.internal.stripe.prices.getDefaultForLookupKey, { productLookupKey: FORECASTER_PRODUCT_LOOKUP_KEY }).pipe(Effect.orDie);
		if (price === null) {
			return yield* Effect.die(new Error("Billing catalog is not synced yet"));
		}
		const { stripeCustomerId, userDetailsId } = yield* resolveStripeCustomer();
		const hasLive = yield* queryRunner.runQuery(refs.internal.stripe.sync.hasLiveSubscription, { userDetailsId }).pipe(Effect.orDie);
		if (hasLive) {
			return yield* Effect.die(new Error("You already have a Forecaster subscription. Use Manage billing."));
		}
		const returnUrl = `${siteUrl()}${safeReturnPath(returnPath)}`;
		const createSession = () => stripe().checkout.sessions.create({
				customer: stripeCustomerId,
				line_items: [{ price: price.stripePriceId, quantity: 1 }],
				mode: "subscription",
				success_url: returnUrl,
				cancel_url: returnUrl,
			});
		const session = yield* Effect.promise(createSession);
		return session.url === null ? yield* Effect.die(new Error("Could not create checkout session")) : { url: session.url };
	}),
);

const billingPortalSession = FunctionImpl.make(
	databaseSchema,
	checkout,
	"createBillingPortalSession",
	Effect.fnUntraced(function* ({ returnPath }) {
		const { stripeCustomerId } = yield* resolveStripeCustomer();
		const createSession = () => stripe().billingPortal.sessions.create({
				customer: stripeCustomerId,
				return_url: `${siteUrl()}${safeReturnPath(returnPath)}`,
			});
		const session = yield* Effect.promise(createSession);
		return { url: session.url };
	}),
);

export default GroupImpl.make(databaseSchema, checkout).pipe(Layer.provide(checkoutSession), Layer.provide(billingPortalSession), Layer.provide(RequireUser), Layer.provide(telemetryMiddleware),
	GroupImpl.finalize);
