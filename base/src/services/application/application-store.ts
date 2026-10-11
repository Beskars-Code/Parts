import { QueryResult } from "@confect/react";
import * as Effect from "effect/Effect";
import * as ManagedRuntime from "effect/ManagedRuntime";
import * as Result from "effect/Result";

import { SessionSource } from "../../../services/auth/access";
import { BillingService } from "../../../services/billing/service";
import { TransportError } from "../../../services/errors/transport-error";
import { TodoService } from "../../../services/todos/service";

import type { AdminService } from "../../../services/admin/service";
import type { Principal, NotAuthenticated } from "../../../services/auth/access";
import type { PlanSummary } from "../../../services/billing/service";
import type { Task, TodoError } from "../../../services/todos/service";
import type { AuthService } from "../auth/auth-service";
import type * as Layer from "effect/Layer";

export type ApplicationServices = TodoService | BillingService | AdminService | SessionSource | AuthService;

type SessionState =
	| { readonly _tag: "Loading" }
	| { readonly _tag: "SignedOut" }
	| { readonly _tag: "SignedIn"; readonly principal: Principal; readonly error: TransportError | null }
	| { readonly _tag: "Unavailable"; readonly error: TransportError };

export interface ApplicationSnapshot {
	readonly tasks: QueryResult.QueryResult<readonly Task[], TodoError>;
	readonly taskRows: readonly Task[] | null;
	readonly plan: QueryResult.QueryResult<PlanSummary, NotAuthenticated | TransportError>;
	readonly session: SessionState;
}

const readWorkspace = Effect.all({
	tasks: TodoService.pipe(Effect.flatMap(todos => todos.list()), Effect.result),
	plan: BillingService.pipe(Effect.flatMap(billing => billing.getPlan()), Effect.result),
	principal: SessionSource.pipe(Effect.flatMap(session => session.current), Effect.result),
}, { concurrency: "unbounded" });

function queryResult<A, E>(result: Result.Result<A, E>) {
	return Result.match(result, { onSuccess: value => QueryResult.succeed(value), onFailure: error => QueryResult.fail(error) });
}

function sessionResult(result: Result.Result<Principal | null, TransportError>, previous: SessionState): SessionState {
	return Result.match(result, {
		onSuccess: (principal): SessionState => principal === null
			? { _tag: "SignedOut" }
			: { _tag: "SignedIn", principal, error: null },
		onFailure: (error): SessionState => previous._tag === "SignedIn"
			? { ...previous, error }
			: { _tag: "Unavailable", error },
	});
}

function retainedTaskRows(result: Result.Result<readonly Task[], TodoError>, session: SessionState, previous: ApplicationSnapshot) {
	if (session._tag !== "SignedIn") { return null; }
	return Result.match(result, {
		onSuccess: tasks => tasks,
		onFailure: () => previous.session._tag === "SignedIn" && previous.session.principal.id === session.principal.id
			? previous.taskRows : null,
	});
}

export class ApplicationStore {
	private snapshot: ApplicationSnapshot = {
		tasks: QueryResult.load(false), taskRows: null, plan: QueryResult.load(false), session: { _tag: "Loading" },
	};
	private readonly serverSnapshot = this.snapshot;
	private readonly listeners = new Set<() => void>();
	private runtime: ManagedRuntime.ManagedRuntime<ApplicationServices, never> | undefined;
	private disconnect: (() => void) | undefined;
	private revision = 0;

	public readonly getSnapshot = () => this.snapshot;
	public readonly getServerSnapshot = () => this.serverSnapshot;

	public readonly subscribe = (listener: () => void) => {
		this.listeners.add(listener);
		if (this.isEnabled && this.listeners.size === 1) {
			this.disconnect = this.connect?.(this.refresh);
			this.refresh();
		}
		return () => {
			this.listeners.delete(listener);
			if (this.listeners.size > 0) {
				return;
			}

			this.disconnect?.();
			this.disconnect = undefined;
			this.revision++;
			const runtime = this.runtime;
			this.runtime = undefined;
			if (runtime !== undefined) {
				Effect.runFork(runtime.disposeEffect);
			}
		};
	};

	public readonly refresh = () => {
		if (!this.isEnabled) { return; }
		const revision = ++this.revision;
		this.run(readWorkspace.pipe(Effect.matchCause({
			onSuccess: values => {
				this.publish(revision, values);
			},
			onFailure: () => {
				const error = new TransportError({ message: "Workspace could not be refreshed" });
				this.publish(revision, { tasks: Result.fail(error), plan: Result.fail(error), principal: Result.fail(error) });
			},
		})));
	};

	public constructor(
		private readonly layer: Layer.Layer<ApplicationServices>,
		private readonly connect: ((onChange: () => void) => () => void) | undefined,
		private readonly isEnabled: boolean,
	) {}

	private publish(revision: number, values: Effect.Success<typeof readWorkspace>) {
		if (revision !== this.revision) { return; }
		const session = sessionResult(values.principal, this.snapshot.session);
		this.snapshot = {
			tasks: queryResult(values.tasks), plan: queryResult(values.plan),
			taskRows: retainedTaskRows(values.tasks, session, this.snapshot), session,
		};
		for (const listener of this.listeners) { listener(); }
	}

	public run<A>(operation: Effect.Effect<A, never, ApplicationServices>) {
		if (this.listeners.size === 0) { return; }
		this.runtime ??= ManagedRuntime.make(this.layer);
		const runtime = this.runtime;
		runtime.runFork(operation);
	}
}
