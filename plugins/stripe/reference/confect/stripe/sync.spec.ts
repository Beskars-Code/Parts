import * as FunctionSpec from "@confect/core/FunctionSpec";
import * as GroupSpec from "@confect/core/GroupSpec";
import * as Schema from "effect/Schema";

import { Id } from "../_generated/id";
import Telemetry from "../middleware/telemetry.spec";

const handleEventArgs = {
	eventId: Schema.String,
	type: Schema.String,
	created: Schema.Number,
	subscriptionId: Schema.optionalKey(Schema.String),
	customerId: Schema.optionalKey(Schema.String),
};

const handleEvent = FunctionSpec.internalAction({
	name: "handleEvent",
	args: () => handleEventArgs,
	returns: () => Schema.Null,
});

const upsertSubscriptionArgs = {
	stripeSubscriptionId: Schema.String,
	customerId: Schema.String,
	status: Schema.String,
	stripePriceId: Schema.String,
	cancelAtPeriodEnd: Schema.Boolean,
	cancelAt: Schema.optionalKey(Schema.Number),
	endedAt: Schema.optionalKey(Schema.Number),
	billingCycleAnchorMs: Schema.Number,
	currentPeriodStart: Schema.optionalKey(Schema.Number),
	currentPeriodEnd: Schema.optionalKey(Schema.Number),
	eventCreated: Schema.Number,
};

const upsertSubscription = FunctionSpec.internalMutation({
	name: "upsertSubscription",
	args: () => upsertSubscriptionArgs,
	returns: () => Schema.Null,
});

const liveSubscriptionArgs = {
	userDetailsId: Id("userDetails"),
};

const liveSubscriptionCheck = FunctionSpec.internalQuery({
	name: "hasLiveSubscription",
	args: () => liveSubscriptionArgs,
	returns: () => Schema.Boolean,
});

const stripeCustomerIdArgs = {
	userDetailsId: Id("userDetails"),
	stripeCustomerId: Schema.String,
};

const stripeCustomerIdWrite = FunctionSpec.internalMutation({
	name: "setStripeCustomerId",
	args: () => stripeCustomerIdArgs,
	returns: () => Schema.Null,
});

export default GroupSpec.make().middleware(Telemetry).addFunction(handleEvent).addFunction(upsertSubscription).addFunction(liveSubscriptionCheck).addFunction(stripeCustomerIdWrite);
