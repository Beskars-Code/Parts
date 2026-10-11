import { Table } from "@confect/core";
import * as Schema from "effect/Schema";

export default Table.make(() => Schema.Struct({
	ownerId: Schema.String, plan: Schema.Literals(["free", "pro"]), todoCount: Schema.Number,
})).index("by_owner", ["ownerId"]);
