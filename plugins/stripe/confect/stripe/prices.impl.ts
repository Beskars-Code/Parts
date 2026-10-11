import * as FunctionImpl from "@confect/server/FunctionImpl";
import * as GroupImpl from "@confect/server/GroupImpl";
import * as Clock from "effect/Clock";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Option from "effect/Option";
import * as Stream from "effect/Stream";

import prices from "./prices.spec.ts";
import databaseSchema from "../_generated/schema";
import { DatabaseReader, DatabaseWriter } from "../_generated/services";

const findByStripeId = Effect.fnUntraced(function* (stripePriceId: string) {
	const reader = yield* DatabaseReader;
	return yield* reader
		.table("prices")
		.index("by_stripePriceId", (q) => q.eq("stripePriceId", stripePriceId))
		.first()
		.pipe(Effect.orDie);
});

const upsert = FunctionImpl.make(databaseSchema, prices, "upsert", Effect.fnUntraced(function* (args) {
		const writer = yield* DatabaseWriter;
		const updatedAt = yield* Clock.currentTimeMillis;
		const existing = yield* findByStripeId(args.stripePriceId);
		if (Option.isSome(existing)) {
			yield* writer
				.table("prices")
				.patch(existing.value._id, { ...args, updatedAt })
				.pipe(Effect.orDie);
			return existing.value._id;
		}
		return yield* writer
			.table("prices")
			.insert({ ...args, updatedAt })
			.pipe(Effect.orDie);
	}));

const archiveByStripeId = FunctionImpl.make(databaseSchema, prices, "archiveByStripeId", Effect.fnUntraced(function* ({ stripePriceId }) {
		const existing = yield* findByStripeId(stripePriceId);
		if (Option.isSome(existing)) {
			const writer = yield* DatabaseWriter;
			const updatedAt = yield* Clock.currentTimeMillis;
			yield* writer.table("prices").patch(existing.value._id, { status: "archived", updatedAt }).pipe(Effect.orDie);
		}
		return null;
	}));

const priceByStripeId = FunctionImpl.make(databaseSchema, prices, "getByStripeId", ({ stripePriceId }) => findByStripeId(stripePriceId).pipe(Effect.map((row) => Option.getOrNull(row))));

const listActiveStripeIds = FunctionImpl.make(databaseSchema, prices, "listActiveStripeIds", Effect.fnUntraced(function* () {
		const reader = yield* DatabaseReader;
		const rows = yield* reader.table("prices").index("by_creation_time").collect().pipe(Effect.orDie);
		return rows.filter((row) => row.status === "active").map((row) => row.stripePriceId);
	}));

const defaultPriceForLookupKey = FunctionImpl.make(databaseSchema, prices, "getDefaultForLookupKey", Effect.fnUntraced(function* ({ productLookupKey }) {
		const reader = yield* DatabaseReader;
		const product = yield* reader
			.table("products")
			.index("by_lookupKey", (q) => q.eq("lookupKey", productLookupKey))
			.stream()
			.pipe(Stream.filter((row) => row.status === "active"), Stream.runHead, Effect.orDie);
		if (Option.isNone(product)) {
			return null;
		}
		const rows = yield* reader
			.table("prices")
			.index("by_productId", (q) => q.eq("productId", product.value._id))
			.stream()
			.pipe(
				Stream.filter((row) => row.isDefault && row.status === "active"),
				Stream.runHead,
				Effect.orDie,
			);
		return Option.getOrNull(rows);
	}));

export default GroupImpl.make(databaseSchema, prices).pipe(
	Layer.provide(upsert),
	Layer.provide(archiveByStripeId),
	Layer.provide(priceByStripeId),
	Layer.provide(listActiveStripeIds),
	Layer.provide(defaultPriceForLookupKey),
	GroupImpl.finalize,
);

