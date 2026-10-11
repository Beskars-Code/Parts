import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

import type * as Scope from "effect/Scope";

export function requestRuntime<A, E, R, Provided, BuildError, Required>(
	operation: Effect.Effect<A, E, R>,
	layer: Layer.Layer<Provided, BuildError, Required>,
): Effect.Effect<A, E | BuildError, Exclude<Required | Exclude<R, Provided>, Scope.Scope>> {
	return Effect.scoped(Effect.flatMap(Layer.build(layer), context => Effect.provideContext(operation, context)));
}
