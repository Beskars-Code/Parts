import { Table } from "@confect/core";
import * as Schema from "effect/Schema";

export default Table.make(() => Schema.Struct({
	ownerId: Schema.String,
	title: Schema.String,
	completed: Schema.Boolean,
})).index("by_owner", ["ownerId"]);
