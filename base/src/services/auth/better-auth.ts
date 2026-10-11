import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

import { authClient } from "./auth-client";
import { AuthRequestError } from "./auth-request-error";
import { AuthService } from "./auth-service";

export const BetterAuthLive = Layer.succeed(AuthService, {
	signIn: (email, password) => Effect.tryPromise({
		try: () => authClient.signIn.email({ email, password, fetchOptions: { throw: true } }),
		catch: () => new AuthRequestError(),
	}).pipe(Effect.asVoid),
	signUp: (name, email, password) => Effect.tryPromise({
		try: () => authClient.signUp.email({ name, email, password, fetchOptions: { throw: true } }),
		catch: () => new AuthRequestError(),
	}).pipe(Effect.asVoid),
	signOut: Effect.tryPromise({
		try: () => authClient.signOut({ fetchOptions: { throw: true } }),
		catch: () => new AuthRequestError(),
	}).pipe(Effect.asVoid),
});
