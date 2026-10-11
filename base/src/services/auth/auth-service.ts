import * as Context from "effect/Context";

import type { AuthRequestError } from "./auth-request-error";
import type * as Effect from "effect/Effect";


export class AuthService extends Context.Service<AuthService, {
	readonly signIn: (email: string, password: string) => Effect.Effect<void, AuthRequestError>;
	readonly signUp: (name: string, email: string, password: string) => Effect.Effect<void, AuthRequestError>;
	readonly signOut: Effect.Effect<void, AuthRequestError>;
}>()("parts-project/services/auth/auth-service/AuthService") {}
