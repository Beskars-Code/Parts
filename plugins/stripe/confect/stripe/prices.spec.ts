import * as FunctionSpec from "@confect/core/FunctionSpec";
import * as GroupSpec from "@confect/core/GroupSpec";
import * as Schema from "effect/Schema";

import { Id } from "../_generated/id";
import prices from "../_generated/tables/prices";

const upsertArgs = {
			stripePriceId: Schema.String,
			productId: Id("products"),
			amount: Schema.Number,
			currency: Schema.String,
			interval: Schema.String,
			nickname: Schema.String,
			isDefault: Schema.Boolean,
			status: Schema.Literals(["active", "archived"]),
		};

const upsert = FunctionSpec.internalMutation({
	name: "upsert",
	args: () => upsertArgs,
	returns: () => Id("prices"),
});

const archiveByStripeId = FunctionSpec.internalMutation({
	name: "archiveByStripeId",
	args: () => ({ stripePriceId: Schema.String }),
	returns: () => Schema.Null,
});

const priceByStripeId = FunctionSpec.internalQuery({
	name: "getByStripeId",
	args: () => ({ stripePriceId: Schema.String }),
	returns: () => Schema.NullOr(prices.Doc),
});

const listActiveStripeIds = FunctionSpec.internalQuery({
	name: "listActiveStripeIds",
	returns: () => Schema.Array(Schema.String),
});

const defaultPriceForLookupKey = FunctionSpec.internalQuery({
	name: "getDefaultForLookupKey",
	args: () => ({ productLookupKey: Schema.String }),
	returns: () => Schema.NullOr(prices.Doc),
});

export default GroupSpec.make()
	.addFunction(upsert)
	.addFunction(archiveByStripeId)
	.addFunction(priceByStripeId)
	.addFunction(listActiveStripeIds)
	.addFunction(defaultPriceForLookupKey);
