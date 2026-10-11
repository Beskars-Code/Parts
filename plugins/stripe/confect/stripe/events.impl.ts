import * as FunctionImpl from "@confect/server/FunctionImpl";
import * as GroupImpl from "@confect/server/GroupImpl";
import * as Clock from "effect/Clock";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Option from "effect/Option";

import events from "./events.spec.ts";
import databaseSchema from "../_generated/schema";
import { DatabaseReader, DatabaseWriter } from "../_generated/services";

const findEvent = Effect.fnUntraced(function* (eventId: string) {
	const reader = yield* DatabaseReader;
	return yield* reader
		.table("stripeEvents")
		.index("by_eventId", (q) => q.eq("eventId", eventId))
		.first()
		.pipe(Effect.orDie);
});

const eventLookup = FunctionImpl.make(databaseSchema, events, "hasEvent", ({ eventId }) => findEvent(eventId).pipe(Effect.map((found) => Option.isSome(found))));

const recordEvent = FunctionImpl.make(
	databaseSchema,
	events,
	"recordEvent",
	Effect.fnUntraced(function* ({ eventId, type, created }) {
		const existing = yield* findEvent(eventId);
		if (Option.isSome(existing)) {
			return "duplicate" as const;
		}
		const writer = yield* DatabaseWriter;
		const processedAt = yield* Clock.currentTimeMillis;
		yield* writer.table("stripeEvents").insert({ eventId, type, created, processedAt }).pipe(Effect.orDie);
		return "fresh" as const;
	}),
);

export default GroupImpl.make(databaseSchema, events).pipe(Layer.provide(eventLookup), Layer.provide(recordEvent), GroupImpl.finalize);

