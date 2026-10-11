import * as FunctionSpec from "@confect/core/FunctionSpec";
import * as GroupSpec from "@confect/core/GroupSpec";
import * as Schema from "effect/Schema";

import { Id } from "../_generated/id";
import products from "../_generated/tables/products";

const upsertArgs = {
			stripeProductId: Schema.String,
			name: Schema.String,
			description: Schema.optionalKey(Schema.String),
			lookupKey: Schema.String,
			status: Schema.Literals(["active", "archived"]),
			defaultStripePriceId: Schema.optionalKey(Schema.String),
		};

const upsert = FunctionSpec.internalMutation({
	name: "upsert",
	args: () => upsertArgs,
	returns: () => Id("products"),
});

const archiveByStripeId = FunctionSpec.internalMutation({
	name: "archiveByStripeId",
	args: () => ({ stripeProductId: Schema.String }),
	returns: () => Schema.Null,
});

const listActiveStripeIds = FunctionSpec.internalQuery({
	name: "listActiveStripeIds",
	returns: () => Schema.Array(Schema.String),
});

const productByLookupKey = FunctionSpec.internalQuery({
	name: "getByLookupKey",
	args: () => ({ lookupKey: Schema.String }),
	returns: () => Schema.NullOr(products.Doc),
});

export default GroupSpec.make()
	.addFunction(upsert)
	.addFunction(archiveByStripeId)
	.addFunction(listActiveStripeIds)
	.addFunction(productByLookupKey);
