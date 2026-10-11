import * as Context from "effect/Context";

import type { Task, TaskId } from "./service";
import type { PrincipalId } from "../auth/access";
import type { TransportError } from "../errors/transport-error";
import type * as Effect from "effect/Effect";

export class TodoStore extends Context.Service<TodoStore, {
	readonly list: (ownerId: PrincipalId) => Effect.Effect<readonly Task[], TransportError>;
	readonly get: (id: TaskId) => Effect.Effect<Task | null, TransportError>;
	readonly insert: (ownerId: PrincipalId, title: string) => Effect.Effect<TaskId, TransportError>;
	readonly rename: (id: TaskId, title: string) => Effect.Effect<void, TransportError>;
	readonly setCompleted: (id: TaskId, isCompleted: boolean) => Effect.Effect<void, TransportError>;
	readonly remove: (id: TaskId) => Effect.Effect<void, TransportError>;
}>()("parts-project/services/todos/store/TodoStore") {}
