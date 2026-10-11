import { Table } from "@confect/core";
import { GenericId as Id } from "@confect/core/GenericId";
import * as Schema from "effect/Schema";

const subscriptionsSchema = Schema.Struct({
	stripeSubscriptionId: Schema.String,
	userDetailsId: Id("userDetails"),
	status: Schema.String,
	priceId: Id("prices"),
	productId: Id("products"),
	cancelAtPeriodEnd: Schema.Boolean,
	cancelAt: Schema.optionalKey(Schema.Number),
	endedAt: Schema.optionalKey(Schema.Number),
	billingCycleAnchorMs: Schema.Number,
	currentPeriodStart: Schema.optionalKey(Schema.Number),
	currentPeriodEnd: Schema.optionalKey(Schema.Number),
	lastEventCreated: Schema.optionalKey(Schema.Number),
});

const subscriptions = Table.make(() => subscriptionsSchema)
	.index("by_stripeSubscriptionId", ["stripeSubscriptionId"])
	.index("by_userDetailsId", ["userDetailsId"])
	.index("by_userDetailsId_status", ["userDetailsId", "status"]);

export default subscriptions;
