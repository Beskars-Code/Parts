import { FunctionImpl, GroupImpl } from "@confect/server";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

import databaseSchema from "./_generated/schema";
import requireUserImpl from "./middleware/requireuser.impl";
import { TodoService, TodoServiceLive } from "../services/todos/service";
import { AccessLive } from "./services/auth/session";
import { AccountStoreReadLive, AccountStoreWriteLive } from "./services/billing/account-store";
import { BillingReadLive, BillingWriteLive } from "./services/billing/layers";
import { requestRuntime } from "./services/request/runtime";
import { TodoStoreReadLive, TodoStoreWriteLive } from "./services/todos/store";
import spec from "./todos.spec";

const readLive = TodoServiceLive.pipe(Layer.provide(Layer.mergeAll(AccessLive, BillingReadLive, AccountStoreReadLive, TodoStoreReadLive)));
const writeLive = TodoServiceLive.pipe(Layer.provide(Layer.mergeAll(AccessLive, BillingWriteLive, AccountStoreWriteLive, TodoStoreWriteLive)));

export default GroupImpl.make(databaseSchema, spec).pipe(
	Layer.provide(FunctionImpl.make(databaseSchema, spec, "list", () => requestRuntime(TodoService.pipe(Effect.flatMap(service => service.list())), readLive))),
	Layer.provide(FunctionImpl.make(databaseSchema, spec, "create", ({ title }) => requestRuntime(TodoService.pipe(Effect.flatMap(service => service.create(title))), writeLive))),
	Layer.provide(FunctionImpl.make(databaseSchema, spec, "rename", ({ id, title }) => requestRuntime(TodoService.pipe(Effect.flatMap(service => service.rename(id, title))), writeLive))),
	Layer.provide(FunctionImpl.make(databaseSchema, spec, "setCompleted", ({ id, completed }) => requestRuntime(TodoService.pipe(Effect.flatMap(service => service.setCompleted(id, completed))), writeLive))),
	Layer.provide(FunctionImpl.make(databaseSchema, spec, "remove", ({ id }) => requestRuntime(TodoService.pipe(Effect.flatMap(service => service.remove(id))), writeLive))),
	Layer.provide(requireUserImpl),
	GroupImpl.finalize,
);
