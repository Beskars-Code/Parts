import * as FunctionImpl from "@confect/server/FunctionImpl";
import * as GroupImpl from "@confect/server/GroupImpl";
import * as Clock from "effect/Clock";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Option from "effect/Option";

import { stripe } from "./provider/config";
import sync from "./sync.spec.ts";
import refs from "../_generated/refs";
import databaseSchema from "../_generated/schema";
import { DatabaseReader, DatabaseWriter, MutationRunner } from "../_generated/services";
import telemetryMiddleware from "../middleware/telemetry.impl";
import { planFromLookupKey } from "../services/billing/catalog";
import { Entitlements } from "../services/billing/entitlements";

import type { Docs } from "../_generated/docs";
import type Stripe from "stripe";

const stripePriceIdOf = (subscription: Stripe.Subscription): string | undefined => subscription.items.data.at(0)?.price.id;

const eventCustomerId = (subscription: Stripe.Subscription, fallback: string | undefined): string | undefined => fallback ?? (typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id);

const subscriptionArgs = (subscription: Stripe.Subscription, customerId: string, eventCreated: number) => {
	const firstItem = subscription.items.data.at(0);
	const resultValue = {
		stripeSubscriptionId: subscription.id,
		customerId,
		status: subscription.status,
		cancelAtPeriodEnd: subscription.cancel_at_period_end,
		...(subscription.cancel_at === null ? {} : { cancelAt: subscription.cancel_at * 1000 }),
		...(subscription.ended_at === null ? {} : { endedAt: subscription.ended_at * 1000 }),
		billingCycleAnchorMs: subscription.billing_cycle_anchor * 1000,
		...(firstItem === undefined ? {} : { currentPeriodStart: firstItem.current_period_start * 1000, currentPeriodEnd: firstItem.current_period_end * 1000 }),
		eventCreated,
	};
	return resultValue;
};

// A Stripe API failure must propagate so the action throws, the webhook returns 500, and Stripe retries. Log-and-skip is only for permanent misses (no id on the event, unknown customer, unknown price).
const retrieveSubscription = (subscriptionId: string) => {
	const resultValue = Effect.tryPromise(() => stripe().subscriptions.retrieve(subscriptionId, { expand: ["items.data.price"] })).pipe(Effect.orDie);
	return resultValue;
};

const handleEvent = FunctionImpl.make(
	databaseSchema,
	sync,
	"handleEvent",
	Effect.fnUntraced(function* (args) {
		if (args.subscriptionId === undefined) {
			yield* Effect.logWarning(`[Stripe Sync] no subscription for event ${args.eventId} type=${args.type}`);
			return null;
		}
		const subscription = yield* retrieveSubscription(args.subscriptionId);
		const stripePriceId = stripePriceIdOf(subscription);
		const customerId = eventCustomerId(subscription, args.customerId);
		if (stripePriceId === undefined || customerId === undefined) {
			yield* Effect.logWarning(`[Stripe Sync] missing price or customer for event ${args.eventId}`);
			return null;
		}
		const runner = yield* MutationRunner;
		yield* runner
			.runMutation(refs.internal.stripe.sync.upsertSubscription, {
				...subscriptionArgs(subscription, customerId, args.created),
				stripePriceId,
			})
			.pipe(Effect.orDie);
		return null;
	}),
);

const findByStripeCustomerId = Effect.fnUntraced(function* (customerId: string) {
	const reader = yield* DatabaseReader;
	return yield* reader
		.table("userDetails")
		.index("by_stripeCustomerId", (q) => q.eq("stripeCustomerId", customerId))
		.first()
		.pipe(Effect.orDie);
});

const findPriceAndProduct = Effect.fnUntraced(function* (stripePriceId: string) {
	const reader = yield* DatabaseReader;
	const price = yield* reader
		.table("prices")
		.index("by_stripePriceId", (q) => q.eq("stripePriceId", stripePriceId))
		.first()
		.pipe(Effect.orDie);
	if (Option.isNone(price)) {
		return null;
	}
	const product = yield* reader.table("products").get(price.value.productId).pipe(Effect.orDie);
	return { price: price.value, product };
});

interface SubscriptionArgs {
	stripeSubscriptionId: string;
	status: string;
	cancelAtPeriodEnd: boolean;
	cancelAt?: number | undefined;
	endedAt?: number | undefined;
	billingCycleAnchorMs: number;
	currentPeriodStart?: number | undefined;
	currentPeriodEnd?: number | undefined;
	eventCreated: number;
}

const subscriptionFields = (args: SubscriptionArgs, details: Docs["userDetails"], found: { price: Docs["prices"]; product: Docs["products"] }) => ({
	userDetailsId: details._id,
	status: args.status,
	priceId: found.price._id,
	productId: found.product._id,
	cancelAtPeriodEnd: args.cancelAtPeriodEnd,
	...(args.cancelAt === undefined ? {} : { cancelAt: args.cancelAt }),
	...(args.endedAt === undefined ? {} : { endedAt: args.endedAt }),
	billingCycleAnchorMs: args.billingCycleAnchorMs,
	...(args.currentPeriodStart === undefined ? {} : { currentPeriodStart: args.currentPeriodStart }),
	...(args.currentPeriodEnd === undefined ? {} : { currentPeriodEnd: args.currentPeriodEnd }),
	lastEventCreated: args.eventCreated,
});

const writeSubscription = Effect.fnUntraced(function* (args: SubscriptionArgs, details: Docs["userDetails"], found: { price: Docs["prices"]; product: Docs["products"] }, existing: Option.Option<Docs["subscriptions"]>) {
	const writer = yield* DatabaseWriter;
	const fields = subscriptionFields(args, details, found);
	if (Option.isSome(existing)) {
		yield* writer.table("subscriptions").patch(existing.value._id, fields).pipe(Effect.orDie);
		return;
	}
	yield* writer
		.table("subscriptions")
		.insert({ stripeSubscriptionId: args.stripeSubscriptionId, ...fields })
		.pipe(Effect.orDie);
});

const isStaleEvent = (existing: Option.Option<Docs["subscriptions"]>, eventCreated: number): boolean =>
	Option.isSome(existing) && existing.value.lastEventCreated !== undefined && eventCreated < existing.value.lastEventCreated;

const subscriptionUpsert = FunctionImpl.make(
	databaseSchema,
	sync,
	"upsertSubscription",
	Effect.fnUntraced(function* (args) {
		const reader = yield* DatabaseReader;
		const details = yield* findByStripeCustomerId(args.customerId);
		if (Option.isNone(details)) {
			yield* Effect.logWarning(`[Stripe Sync] unknown customer ${args.customerId} for ${args.stripeSubscriptionId}`);
			return null;
		}
		const found = yield* findPriceAndProduct(args.stripePriceId);
		if (found === null) {
			yield* Effect.logWarning(`[Stripe Sync] unknown price ${args.stripePriceId} for ${args.stripeSubscriptionId}`);
			return null;
		}
		const existing = yield* reader
			.table("subscriptions")
			.index("by_stripeSubscriptionId", (q) => q.eq("stripeSubscriptionId", args.stripeSubscriptionId))
			.first()
			.pipe(Effect.orDie);
		if (isStaleEvent(existing, args.eventCreated)) {
			return null;
		}
		yield* writeSubscription(args, details.value, found, existing);
		yield* Entitlements.applyProcessorState({
			userDetailsId: details.value._id,
			plan: planFromLookupKey(found.product.lookupKey),
			planStatus: args.status,
			stripeSubscriptionId: args.stripeSubscriptionId,
			cycleAnchorMs: args.billingCycleAnchorMs,
			currentPeriodStart: args.currentPeriodStart,
			currentPeriodEnd: args.currentPeriodEnd,
			eventCreated: args.eventCreated,
		});
		return null;
	}),
);

const LIVE_SUBSCRIPTION_STATUSES = new Set(["active", "trialing", "past_due", "unpaid"]);

const liveSubscriptionCheck = FunctionImpl.make(
	databaseSchema,
	sync,
	"hasLiveSubscription",
	Effect.fnUntraced(function* ({ userDetailsId }) {
		const reader = yield* DatabaseReader;
		const rows = yield* reader
			.table("subscriptions")
			.index("by_userDetailsId", (q) => q.eq("userDetailsId", userDetailsId))
			.take(50)
			.pipe(Effect.orDie);
		return rows.some((row) => LIVE_SUBSCRIPTION_STATUSES.has(row.status));
	}),
);

const stripeCustomerIdSave = FunctionImpl.make(
	databaseSchema,
	sync,
	"setStripeCustomerId",
	Effect.fnUntraced(function* ({ userDetailsId, stripeCustomerId }) {
		const writer = yield* DatabaseWriter;
		const updatedAt = yield* Clock.currentTimeMillis;
		yield* writer.table("userDetails").patch(userDetailsId, { stripeCustomerId, updatedAt }).pipe(Effect.orDie);
		return null;
	}),
);

export default GroupImpl.make(databaseSchema, sync).pipe(
	Layer.provide(handleEvent),
	Layer.provide(subscriptionUpsert),
	Layer.provide(liveSubscriptionCheck),
	Layer.provide(stripeCustomerIdSave),
	Layer.provide(telemetryMiddleware),
	GroupImpl.finalize,
);
