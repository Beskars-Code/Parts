import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Schema from "effect/Schema";

import { TodoStore } from "./store";
import { AccessService, PrincipalId } from "../auth/access";
import { AccountStore } from "../billing/account-store";
import { BillingService } from "../billing/service";

import type { NotAuthenticated } from "../auth/access";
import type { TransportError } from "../errors/transport-error";

export const TaskId = Schema.String.pipe(Schema.brand("TaskId"));
export type TaskId = typeof TaskId.Type;
export const Task = Schema.Struct({ id: TaskId, ownerId: PrincipalId, title: Schema.String, completed: Schema.Boolean });
export type Task = typeof Task.Type;
export class TaskAccessDenied extends Schema.TaggedError<TaskAccessDenied>()("TaskAccessDenied", {}) {}
export class InvalidTaskTitle extends Schema.TaggedError<InvalidTaskTitle>()("InvalidTaskTitle", {}) {}
export class TaskLimitReached extends Schema.TaggedError<TaskLimitReached>()("TaskLimitReached", { limit: Schema.Number }) {}
export type TodoError = NotAuthenticated | TaskAccessDenied | InvalidTaskTitle | TaskLimitReached | TransportError;

const validTitle = (title: string) => {
	const normalized = title.trim();
	return normalized.length === 0 || normalized.length > 200 ? Effect.fail(new InvalidTaskTitle()) : Effect.succeed(normalized);
};

export class TodoService extends Context.Service<TodoService, {
	readonly list: () => Effect.Effect<readonly Task[], TodoError>;
	readonly create: (title: string) => Effect.Effect<TaskId, TodoError>;
	readonly rename: (id: TaskId, title: string) => Effect.Effect<null, TodoError>;
	readonly setCompleted: (id: TaskId, isCompleted: boolean) => Effect.Effect<null, TodoError>;
	readonly remove: (id: TaskId) => Effect.Effect<null, TodoError>;
}>()("parts-project/services/todos/service/TodoService") {}

export const TodoServiceLive = Layer.effect(TodoService, Effect.gen(function* () {
	const access = yield* AccessService;
	const store = yield* TodoStore;
	const billing = yield* BillingService;
	const accounts = yield* AccountStore;
	const ownedTask = Effect.fnUntraced(function* (id: TaskId) {
		const user = yield* access.requireUser;
		const task = yield* store.get(id);
		return task?.ownerId === user.id ? task : (yield* new TaskAccessDenied());
	});
	const list = Effect.fnUntraced(function* () {
		const user = yield* access.requireUser;
		return yield* store.list(user.id);
	});
	const create = Effect.fnUntraced(function* (title: string) {
		const user = yield* access.requireUser;
		const normalized = yield* validTitle(title);
		const plan = yield* billing.getPlan();
		if (plan.todoCount >= plan.limit) { return yield* new TaskLimitReached({ limit: plan.limit }); }
		const id = yield* store.insert(user.id, normalized);
		yield* accounts.write(user.id, { plan: plan.id, todoCount: plan.todoCount + 1 });
		return id;
	});
	const rename = Effect.fnUntraced(function* (id: TaskId, title: string) {
		yield* ownedTask(id);
		const normalized = yield* validTitle(title);
		yield* store.rename(id, normalized);
		return null;
	});
	const setCompleted = Effect.fnUntraced(function* (id: TaskId, isCompleted: boolean) {
		yield* ownedTask(id);
		yield* store.setCompleted(id, isCompleted);
		return null;
	});
	const remove = Effect.fnUntraced(function* (id: TaskId) {
		const task = yield* ownedTask(id);
		const account = yield* accounts.read(task.ownerId);
		yield* store.remove(id);
		yield* accounts.write(task.ownerId, { ...account, todoCount: account.todoCount - 1 });
		return null;
	});
	return { list, create, rename, setCompleted, remove };
}));
