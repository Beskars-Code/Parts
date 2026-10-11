import { FunctionSpec, GroupSpec } from "@confect/core";
import * as Schema from "effect/Schema";

import RequireUser from "./middleware/requireuser.spec";
import { NotAuthenticated } from "../services/auth/access";
import { TransportError } from "../services/errors/transport-error";
import { Task, TaskId, TaskAccessDenied, InvalidTaskTitle, TaskLimitReached } from "../services/todos/service";

const errors = () => Schema.Union([NotAuthenticated, TaskAccessDenied, InvalidTaskTitle, TaskLimitReached, TransportError]);

export default GroupSpec.make()
	.addFunction(FunctionSpec.publicQuery({ name: "list", args: () => ({}), returns: () => Schema.Array(Task), error: errors }).middleware(RequireUser))
	.addFunction(FunctionSpec.publicMutation({ name: "create", args: () => ({ title: Schema.String }), returns: () => TaskId, error: errors }).middleware(RequireUser))
	.addFunction(FunctionSpec.publicMutation({ name: "rename", args: () => ({ id: TaskId, title: Schema.String }), returns: () => Schema.Null, error: errors }).middleware(RequireUser))
	.addFunction(FunctionSpec.publicMutation({ name: "setCompleted", args: () => ({ id: TaskId, completed: Schema.Boolean }), returns: () => Schema.Null, error: errors }).middleware(RequireUser))
	.addFunction(FunctionSpec.publicMutation({ name: "remove", args: () => ({ id: TaskId }), returns: () => Schema.Null, error: errors }).middleware(RequireUser));
