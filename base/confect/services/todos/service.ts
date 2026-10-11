import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Schema from "effect/Schema";

import { DatabaseReader, DatabaseWriter } from "../../_generated/services";
import { CurrentUser } from "../../middleware/requireuser.spec";

import type { TodosId } from "../../_generated/id";

export class TaskAccessDenied extends Schema.TaggedError<TaskAccessDenied>()("TaskAccessDenied", {
	message: Schema.tag("Task unavailable"),
}) {}

export class InvalidTaskTitle extends Schema.TaggedError<InvalidTaskTitle>()("InvalidTaskTitle", {
	message: Schema.tag("Task title must contain 1 to 200 characters"),
}) {}

const validTitle = (title: string) => {
	const value = title.trim();
	return value.length === 0 || value.length > 200
		? Effect.fail(new InvalidTaskTitle())
		: Effect.succeed(value);
};

const ownedTask = Effect.fnUntraced(function* (id: TodosId) {
	const { user } = yield* CurrentUser;
	const reader = yield* DatabaseReader;
	const task = yield* reader.table("todos").get(id).pipe(Effect.orDie);
	return yield* task.ownerId === user._id ? Effect.succeed(task) : new TaskAccessDenied();
});

const list = Effect.fnUntraced(function* () {
	const { user } = yield* CurrentUser;
	const reader = yield* DatabaseReader;
	return yield* reader.table("todos").index("by_owner", q => q.eq("ownerId", user._id)).take(200).pipe(Effect.orDie);
});

const create = Effect.fnUntraced(function* (title: string) {
	const normalized = yield* validTitle(title);
	const { user } = yield* CurrentUser;
	const writer = yield* DatabaseWriter;
	return yield* writer.table("todos").insert({ ownerId: user._id, title: normalized, completed: false }).pipe(Effect.orDie);
});

const rename = Effect.fnUntraced(function* (id: TodosId, title: string) {
	const normalized = yield* validTitle(title);
	yield* ownedTask(id);
	const writer = yield* DatabaseWriter;
	yield* writer.table("todos").patch(id, { title: normalized }).pipe(Effect.orDie);
	return null;
});

const setCompleted = Effect.fnUntraced(function* (id: TodosId, completed: boolean) {
	yield* ownedTask(id);
	const writer = yield* DatabaseWriter;
	yield* writer.table("todos").patch(id, { completed }).pipe(Effect.orDie);
	return null;
});

const remove = Effect.fnUntraced(function* (id: TodosId) {
	yield* ownedTask(id);
	const writer = yield* DatabaseWriter;
	yield* writer.table("todos").delete(id).pipe(Effect.orDie);
	return null;
});

export class TodoService extends Context.Service<TodoService, {
	readonly list: typeof list;
	readonly create: typeof create;
	readonly rename: typeof rename;
	readonly setCompleted: typeof setCompleted;
	readonly remove: typeof remove;
}>()("parts/TodoService") {}

export const TodoServiceLive = Layer.succeed(TodoService, { list, create, rename, setCompleted, remove });
