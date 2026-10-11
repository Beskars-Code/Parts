import * as FunctionImpl from "@confect/server/FunctionImpl";
import * as GroupImpl from "@confect/server/GroupImpl";
import * as Clock from "effect/Clock";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Option from "effect/Option";
import * as Stream from "effect/Stream";

import products from "./products.spec.ts";
import databaseSchema from "../_generated/schema";
import { DatabaseReader, DatabaseWriter } from "../_generated/services";

const findByStripeId = Effect.fnUntraced(function* (stripeProductId: string) {
	const reader = yield* DatabaseReader;
	return yield* reader
		.table("products")
		.index("by_stripeProductId", (q) => q.eq("stripeProductId", stripeProductId))
		.first()
		.pipe(Effect.orDie);
});

const upsert = FunctionImpl.make(databaseSchema, products, "upsert", Effect.fnUntraced(function* (args) {
		const writer = yield* DatabaseWriter;
		const updatedAt = yield* Clock.currentTimeMillis;
		const existing = yield* findByStripeId(args.stripeProductId);
		if (Option.isSome(existing)) {
			yield* writer
				.table("products")
				.patch(existing.value._id, { ...args, updatedAt })
				.pipe(Effect.orDie);
			return existing.value._id;
		}
		return yield* writer
			.table("products")
			.insert({ ...args, updatedAt })
			.pipe(Effect.orDie);
	}));

const archiveByStripeId = FunctionImpl.make(databaseSchema, products, "archiveByStripeId", Effect.fnUntraced(function* ({ stripeProductId }) {
		const existing = yield* findByStripeId(stripeProductId);
		if (Option.isSome(existing)) {
			const writer = yield* DatabaseWriter;
			const updatedAt = yield* Clock.currentTimeMillis;
			yield* writer.table("products").patch(existing.value._id, { status: "archived", updatedAt }).pipe(Effect.orDie);
		}
		return null;
	}));

const listActiveStripeIds = FunctionImpl.make(databaseSchema, products, "listActiveStripeIds", Effect.fnUntraced(function* () {
		const reader = yield* DatabaseReader;
		const rows = yield* reader.table("products").index("by_creation_time").collect().pipe(Effect.orDie);
		return rows.filter((row) => row.status === "active").map((row) => row.stripeProductId);
	}));

const productByLookupKey = FunctionImpl.make(databaseSchema, products, "getByLookupKey", Effect.fnUntraced(function* ({ lookupKey }) {
		const reader = yield* DatabaseReader;
		return yield* reader
			.table("products")
			.index("by_lookupKey", (q) => q.eq("lookupKey", lookupKey))
			.stream()
			.pipe(
				Stream.filter((row) => row.status === "active"),
				Stream.runHead,
				Effect.map((row) => Option.getOrNull(row)),
				Effect.orDie,
			);
	}));

export default GroupImpl.make(databaseSchema, products).pipe(Layer.provide(upsert), Layer.provide(archiveByStripeId), Layer.provide(listActiveStripeIds), Layer.provide(productByLookupKey), GroupImpl.finalize);

