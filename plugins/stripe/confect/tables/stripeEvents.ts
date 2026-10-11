import { Table } from "@confect/core";
import * as Schema from "effect/Schema";

const stripeEventsSchema = Schema.Struct({
		eventId: Schema.String,
		type: Schema.String,
		created: Schema.Number,
		processedAt: Schema.Number,
	});

const stripeEvents = Table.make(() => stripeEventsSchema).index("by_eventId", ["eventId"]);

export default stripeEvents;
