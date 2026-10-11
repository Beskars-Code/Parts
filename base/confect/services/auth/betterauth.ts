import * as Effect from "effect/Effect";

import { authComponent } from "./component";
import { AdminAccessRequired, NotAuthenticated } from "../../../services/auth/access";

import type { AuthUser } from "./authuser";
import type { ActionCtx, MutationCtx, QueryCtx } from "../../_generated/services";

type AuthContext = QueryCtx | MutationCtx | ActionCtx;

const getUser = Effect.fnUntraced(function* (ctx: AuthContext): Effect.fn.Return<AuthUser | null> {
	return (yield* Effect.promise(() => authComponent.safeGetAuthUser(ctx))) ?? null;
});

const requireUser = Effect.fnUntraced(function* (ctx: AuthContext): Effect.fn.Return<AuthUser, NotAuthenticated> {
	const user = yield* getUser(ctx);
	return yield* user === null ? new NotAuthenticated() : Effect.succeed(user);
});

const requireAdmin = Effect.fnUntraced(function* (ctx: AuthContext): Effect.fn.Return<AuthUser, NotAuthenticated | AdminAccessRequired> {
	const user = yield* requireUser(ctx);
	return yield* user.role === "admin" ? Effect.succeed(user) : new AdminAccessRequired();
});

export const BetterAuth = { getUser, requireUser, requireAdmin };
