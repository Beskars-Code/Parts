import * as FunctionSpec from "@confect/core/FunctionSpec";
import * as GroupSpec from "@confect/core/GroupSpec";
import * as Schema from "effect/Schema";

const eventLookup = FunctionSpec.internalQuery({
	name: "hasEvent",
	args: () => ({ eventId: Schema.String }),
	returns: () => Schema.Boolean,
});

const recordEventArgs = {
	eventId: Schema.String,
	type: Schema.String,
	created: Schema.Number,
};

const recordEvent = FunctionSpec.internalMutation({
	name: "recordEvent",
	args: () => recordEventArgs,
	returns: () => Schema.Literals(["fresh", "duplicate"]),
});

export default GroupSpec.make().addFunction(eventLookup).addFunction(recordEvent);
