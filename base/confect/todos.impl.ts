import { FunctionImpl, GroupImpl } from "@confect/server";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

import databaseSchema from "./_generated/schema";
import requireUserImpl from "./middleware/requireuser.impl";
import { TodoService, TodoServiceLive } from "./services/todos/service";
import spec from "./todos.spec";

export default GroupImpl.make(databaseSchema, spec).pipe(
	Layer.provide(FunctionImpl.make(databaseSchema, spec, "list", () => Effect.flatMap(TodoService, service => service.list()))),
	Layer.provide(FunctionImpl.make(databaseSchema, spec, "create", ({ title }) => Effect.flatMap(TodoService, service => service.create(title)))),
	Layer.provide(FunctionImpl.make(databaseSchema, spec, "rename", ({ id, title }) => Effect.flatMap(TodoService, service => service.rename(id, title)))),
	Layer.provide(FunctionImpl.make(databaseSchema, spec, "setCompleted", ({ id, completed }) => Effect.flatMap(TodoService, service => service.setCompleted(id, completed)))),
	Layer.provide(FunctionImpl.make(databaseSchema, spec, "remove", ({ id }) => Effect.flatMap(TodoService, service => service.remove(id)))),
	Layer.provide(TodoServiceLive),
	Layer.provide(requireUserImpl),
	GroupImpl.finalize,
);
