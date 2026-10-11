import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { expect, it } from "vitest";

import { AdminService, AdminServiceLive } from "../../../services/admin/service";
import { AccessServiceLive, PrincipalId, SessionSource } from "../../../services/auth/access";
import { AccountStore } from "../../../services/billing/account-store";
import { BillingProvider, CheckoutId, CheckoutRequestKey } from "../../../services/billing/provider";
import { BillingService, BillingServiceLive } from "../../../services/billing/service";
import { TaskId, TodoService, TodoServiceLive } from "../../../services/todos/service";
import { TodoStore } from "../../../services/todos/store";

import type { Principal } from "../../../services/auth/access";
import type { Task } from "../../../services/todos/service";

interface Account {
	readonly plan: "free" | "pro";
	readonly todoCount: number;
}
type ExternalServices = SessionSource | TodoStore | AccountStore | BillingProvider;

const owner: Principal = {
	id: PrincipalId.make("owner"),
	name: "Todo owner",
	email: "owner@example.test",
	role: "user",
	permissions: {},
};

function createStorageFixture() {
	const tasks = new Map<TaskId, Task>();
	const accounts = new Map<PrincipalId, Account>();
	let nextId = 0;

	function requireStoredTask(id: TaskId): Task {
		const task = tasks.get(id);
		if (task === undefined) {
			throw new Error(`Fixture task ${id} is missing`);
		}
		return task;
	}

	const taskLayer = Layer.succeed(TodoStore, {
		list: (ownerId) => Effect.sync(() => tasks.values()
			.filter((task) => task.ownerId === ownerId)
			.map((task) => ({ ...task }))
			.toArray()),
		get: (id) => Effect.sync(() => {
			const task = tasks.get(id);
			return task === undefined ? null : { ...task };
		}),
		insert: (ownerId, title) => Effect.sync(() => {
			const id = TaskId.make(`task-${nextId++}`);
			tasks.set(id, { id, ownerId, title, completed: false });
			return id;
		}),
		rename: (id, title) => Effect.sync(() => {
			tasks.set(id, { ...requireStoredTask(id), title });
		}),
		setCompleted: (id, completed) => Effect.sync(() => {
			tasks.set(id, { ...requireStoredTask(id), completed });
		}),
		remove: (id) => Effect.sync(() => {
			requireStoredTask(id);
			tasks.delete(id);
		}),
	});
	const accountLayer = Layer.succeed(AccountStore, {
		read: (ownerId) => Effect.sync(() => ({
			...(accounts.get(ownerId) ?? { plan: "free", todoCount: 0 }),
		})),
		write: (ownerId, account) => Effect.sync(() => {
			accounts.set(ownerId, { ...account });
		}),
	});
	const providerLayer = Layer.succeed(BillingProvider, {
		checkout: (ownerId, requestKey) => Effect.succeed({
			id: CheckoutId.make(`receipt-${ownerId}-${requestKey}`),
			plan: "pro",
			mode: "mock",
		}),
	});

	return {
		layer: (principal: Principal | null) => Layer.mergeAll(
			Layer.succeed(SessionSource, { current: Effect.succeed(principal) }),
			taskLayer,
			accountLayer,
			providerLayer,
		),
		snapshot: () => ({
			tasks: tasks.values().map((task) => ({ ...task })).toArray(),
			accounts: Iterator.from(accounts).map(([ownerId, account]) => ({
				ownerId,
				...account,
			})).toArray(),
		}),
	};
}

function starterLayer(external: Layer.Layer<ExternalServices>) {
	const access = Layer.provide(AccessServiceLive, external);
	const billing = Layer.provide(BillingServiceLive, Layer.mergeAll(access, external));
	return Layer.mergeAll(
		Layer.provide(TodoServiceLive, Layer.mergeAll(access, billing, external)),
		billing,
		Layer.provide(AdminServiceLive, access),
	);
}

function outcomeTag<A, E extends { readonly _tag: string }, R>(
	operation: Effect.Effect<A, E, R>,
): Effect.Effect<string, never, R> {
	return Effect.match(operation, {
		onFailure: (error) => error._tag,
		onSuccess: () => "Succeeded",
	});
}

/**
Rule 1: Free5/Pro25 cap counts all stored todos; writes preserve task/count state.
Why: Broken limits or lost writes would break the starter's plan and todo flow.
What: Free allows five tasks and rejects the sixth; simulated Pro upgrade allows another task; rename, completion and deletion remain observable.
How: Run real TodoService and BillingService with Layer-provided session, task storage, account storage and billing provider, then inspect list and plan.
*/
it("preserves todo writes and counts across the free cap and simulated upgrade", async () => {
	const fixture = createStorageFixture();
	const checkoutRequestKey = CheckoutRequestKey.make("upgrade-request");
	const program = Effect.gen(function* () {
		const todos = yield* TodoService;
		const billing = yield* BillingService;
		expect(yield* todos.list()).toEqual([]);
		expect(yield* billing.getPlan()).toEqual({
			id: "free", limit: 5, todoCount: 0, mode: "mock",
		});
		const firstId = yield* todos.create("First task");
		yield* Effect.forEach(["Second task", "Third task", "Fourth task", "Fifth task"],
			(title) => todos.create(title), { discard: true });
		const freeTasks = yield* todos.list();
		expect(freeTasks).toHaveLength(5);
		expect(freeTasks.map((task) => task.title).toSorted((left, right) => left.localeCompare(right))).toEqual([
			"First task", "Second task", "Third task", "Fourth task", "Fifth task",
		].toSorted((left, right) => left.localeCompare(right)));
		expect(freeTasks).toEqual(expect.arrayContaining([
			{ id: firstId, ownerId: owner.id, title: "First task", completed: false },
		]));
		expect(yield* billing.getPlan()).toEqual({
			id: "free", limit: 5, todoCount: 5, mode: "mock",
		});
		expect(yield* outcomeTag(todos.create("Over the free cap"))).toBe("TaskLimitReached");
		expect(yield* todos.list()).toEqual(freeTasks);
		expect(yield* billing.getPlan()).toEqual({
			id: "free", limit: 5, todoCount: 5, mode: "mock",
		});
		expect(yield* billing.createCheckout(checkoutRequestKey)).toMatchObject({
			plan: "pro", mode: "mock",
		});
		expect(yield* billing.getPlan()).toEqual({
			id: "pro", limit: 25, todoCount: 5, mode: "mock",
		});
		const sixthId = yield* todos.create("Sixth task after upgrade");
		yield* todos.rename(firstId, "Renamed task");
		yield* todos.setCompleted(firstId, true);
		const changedTasks = yield* todos.list();
		expect(changedTasks).toHaveLength(6);
		expect(changedTasks).toEqual(expect.arrayContaining([
			{ id: firstId, ownerId: owner.id, title: "Renamed task", completed: true },
			{ id: sixthId, ownerId: owner.id, title: "Sixth task after upgrade", completed: false },
		]));
		expect(yield* billing.getPlan()).toEqual({
			id: "pro", limit: 25, todoCount: 6, mode: "mock",
		});
		yield* todos.remove(firstId);
		const remainingTasks = yield* todos.list();
		expect(remainingTasks).toHaveLength(5);
		expect(remainingTasks.map((task) => task.title).toSorted((left, right) => left.localeCompare(right))).toEqual([
			"Second task", "Third task", "Fourth task", "Fifth task", "Sixth task after upgrade",
		].toSorted((left, right) => left.localeCompare(right)));
		expect(remainingTasks.some((task) => task.id === firstId)).toBe(false);
		expect(remainingTasks).toEqual(expect.arrayContaining([
			{ id: sixthId, ownerId: owner.id, title: "Sixth task after upgrade", completed: false },
		]));
		expect(yield* billing.getPlan()).toEqual({
			id: "pro", limit: 25, todoCount: 5, mode: "mock",
		});
	});
	const services = starterLayer(fixture.layer(owner));
	await Effect.runPromise(Effect.provide(program, services));
});

/**
Rule 2: Missing identity and another user's task reject with stored data unchanged.
Why: A caller could bypass the UI to change another user's tasks.
What: Missing sessions and non-owners cannot change stored todos.
How: Invoke real TodoService under absent and different Layer-provided sessions and inspect unchanged task storage.
*/
it("rejects missing sessions and non-owner writes without changing storage", async () => {
	const fixture = createStorageFixture();
	const ownerServices = starterLayer(fixture.layer(owner));
	const ownedTaskCreation = TodoService.use((todos) => todos.create("Owner task"));
	const taskId = await Effect.runPromise(Effect.provide(
		ownedTaskCreation,
		ownerServices,
	));
	const before = fixture.snapshot();
	const missingSession = Effect.gen(function* () {
		const todos = yield* TodoService;
		for (const write of [
			todos.create("Unauthorized task"),
			todos.rename(taskId, "Unauthorized rename"),
			todos.setCompleted(taskId, true),
			todos.remove(taskId),
		]) {
			expect(yield* outcomeTag(write)).toBe("NotAuthenticated");
			expect(fixture.snapshot()).toEqual(before);
		}
	});
	const missingSessionServices = starterLayer(fixture.layer(null));
	await Effect.runPromise(Effect.provide(missingSession, missingSessionServices));
	const otherUser: Principal = { ...owner, id: PrincipalId.make("other-user"), email: "other@example.test" };
	const nonOwner = Effect.gen(function* () {
		const todos = yield* TodoService;
		for (const write of [
			todos.rename(taskId, "Other user's rename"),
			todos.setCompleted(taskId, true),
			todos.remove(taskId),
		]) {
			expect(yield* outcomeTag(write)).toBe("TaskAccessDenied");
			expect(fixture.snapshot()).toEqual(before);
		}
	});
	const nonOwnerServices = starterLayer(fixture.layer(otherUser));
	await Effect.runPromise(Effect.provide(nonOwner, nonOwnerServices));
});

/**
Rule 3: Admin overview requires role admin plus exact system:access:true.
Why: Hiding admin UI would not guard the server entry.
What: Ordinary users and admins without the explicit permission are rejected; properly granted admins can read their overview.
How: Run real AdminService with Layer-provided session variants and inspect rejection or returned principal.
*/
it("requires the admin role and explicit permission for the admin overview", async () => {
	const fixture = createStorageFixture();
	const ordinaryUser: Principal = { ...owner, permissions: { "system:access": true } };
	const adminWithoutPermission: Principal = { ...owner, role: "admin" };
	const grantedAdmin: Principal = {
		...owner, role: "admin", permissions: { "system:access": true },
	};
	const ordinaryServices = starterLayer(fixture.layer(ordinaryUser));
	const ordinaryOverview = AdminService.use((admin) => outcomeTag(admin.overview));
	const ordinaryOutcome = await Effect.runPromise(Effect.provide(ordinaryOverview, ordinaryServices));
	expect(ordinaryOutcome).toBe("AdminAccessRequired");
	const ungrantedServices = starterLayer(fixture.layer(adminWithoutPermission));
	const ungrantedOverview = AdminService.use((admin) => outcomeTag(admin.overview));
	const ungrantedOutcome = await Effect.runPromise(Effect.provide(ungrantedOverview, ungrantedServices));
	expect(ungrantedOutcome).toBe("MissingPermission");
	const grantedServices = starterLayer(fixture.layer(grantedAdmin));
	const grantedOverview = AdminService.use((admin) => admin.overview);
	const overview = await Effect.runPromise(Effect.provide(grantedOverview, grantedServices));
	expect(overview).toEqual(grantedAdmin);
});
