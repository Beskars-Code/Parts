import { Table } from "@confect/core";
import * as Schema from "effect/Schema";

const productsSchema = Schema.Struct({
		stripeProductId: Schema.String,
		name: Schema.String,
		description: Schema.optionalKey(Schema.String),
		lookupKey: Schema.String,
		status: Schema.Literals(["active", "archived"]),
		defaultStripePriceId: Schema.optionalKey(Schema.String),
		updatedAt: Schema.Number,
	});

const products = Table.make(() => productsSchema)
	.index("by_stripeProductId", ["stripeProductId"])
	.index("by_lookupKey", ["lookupKey"]);

export default products;
