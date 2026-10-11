import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

import { PrincipalId } from "../../../services/auth/access";
import { plans } from "../../../services/billing/catalog";
import { TaskId } from "../../../services/todos/service";
import { TodoStore } from "../../../services/todos/store";
import { MutationCtx, QueryCtx } from "../../_generated/services";

import type { Task } from "../../../services/todos/service";

const readStore = (ctx: QueryCtx | MutationCtx) => ({
	list: (ownerId: PrincipalId) => Effect.promise(async () => {
		const rows = await ctx.db.query("todos").withIndex("by_owner", q => q.eq("ownerId", ownerId)).take(plans.pro.limit);
		return rows.map(row => ({ id: TaskId.make(row._id), ownerId: PrincipalId.make(row.ownerId), title: row.title, completed: row.completed }));
	}),
	get: (id: TaskId) => Effect.promise(async (): Promise<Task | null> => {
		const normalized = ctx.db.normalizeId("todos", id);
		const row = normalized === null ? null : await ctx.db.get(normalized);
		return row === null ? null : { id: TaskId.make(row._id), ownerId: PrincipalId.make(row.ownerId), title: row.title, completed: row.completed };
	}),
});

const taskId = (ctx: MutationCtx, id: TaskId) => {
	const normalized = ctx.db.normalizeId("todos", id);
	return normalized === null ? Effect.die(new Error("Validated task identifier is unavailable")) : Effect.succeed(normalized);
};

export const TodoStoreReadLive = Layer.effect(TodoStore, QueryCtx.pipe(Effect.map(ctx => ({
	...readStore(ctx),
	insert: () => Effect.die(new Error("Todo writes require a mutation context")),
	rename: () => Effect.die(new Error("Todo writes require a mutation context")),
	setCompleted: () => Effect.die(new Error("Todo writes require a mutation context")),
	remove: () => Effect.die(new Error("Todo writes require a mutation context")),
}))));

export const TodoStoreWriteLive = Layer.effect(TodoStore, MutationCtx.pipe(Effect.map(ctx => ({
	...readStore(ctx),
	insert: (ownerId: PrincipalId, title: string) => Effect.promise(async () => TaskId.make(await ctx.db.insert("todos", { ownerId, title, completed: false }))),
	rename: (id: TaskId, title: string) => taskId(ctx, id).pipe(Effect.flatMap(normalized => Effect.promise(() => ctx.db.patch(normalized, { title })))),
	setCompleted: (id: TaskId, isCompleted: boolean) => taskId(ctx, id).pipe(Effect.flatMap(normalized => Effect.promise(() => ctx.db.patch(normalized, { completed: isCompleted })))),
	remove: (id: TaskId) => taskId(ctx, id).pipe(Effect.flatMap(normalized => Effect.promise(() => ctx.db.delete(normalized)))),
}))));
