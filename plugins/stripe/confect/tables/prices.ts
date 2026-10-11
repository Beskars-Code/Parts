import { Table } from "@confect/core";
import { GenericId as Id } from "@confect/core/GenericId";
import * as Schema from "effect/Schema";

const pricesSchema = Schema.Struct({
		stripePriceId: Schema.String,
		productId: Id("products"),
		amount: Schema.Number,
		currency: Schema.String,
		interval: Schema.String,
		nickname: Schema.String,
		isDefault: Schema.Boolean,
		status: Schema.Literals(["active", "archived"]),
		updatedAt: Schema.Number,
	});

const prices = Table.make(() => pricesSchema)
	.index("by_stripePriceId", ["stripePriceId"])
	.index("by_productId", ["productId"]);

export default prices;
