import { APIError } from "better-auth/api";
import * as Effect from "effect/Effect";

export function runAuthSdk<A>(operation: () => Promise<A>): Effect.Effect<A, APIError> {
	return Effect.tryPromise({
		try: operation,
		catch: (error) => {
			if (error instanceof APIError) {
				return error;
			}
			throw error;
		},
	});
}
