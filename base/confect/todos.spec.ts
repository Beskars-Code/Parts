import { FunctionSpec, GroupSpec } from "@confect/core";
import * as Schema from "effect/Schema";

import { Id } from "./_generated/id";
import todos from "./_generated/tables/todos";
import RequireUser from "./middleware/requireuser.spec";

export default GroupSpec.make()
	.addFunction(FunctionSpec.publicQuery({ name: "list", args: () => ({}), returns: () => Schema.Array(todos.Doc) }).middleware(RequireUser))
	.addFunction(FunctionSpec.publicMutation({ name: "create", args: () => ({ title: Schema.String }), returns: () => Id("todos") }).middleware(RequireUser))
	.addFunction(FunctionSpec.publicMutation({ name: "rename", args: () => ({ id: Id("todos"), title: Schema.String }), returns: () => Schema.Null }).middleware(RequireUser))
	.addFunction(FunctionSpec.publicMutation({ name: "setCompleted", args: () => ({ id: Id("todos"), completed: Schema.Boolean }), returns: () => Schema.Null }).middleware(RequireUser))
	.addFunction(FunctionSpec.publicMutation({ name: "remove", args: () => ({ id: Id("todos") }), returns: () => Schema.Null }).middleware(RequireUser));
