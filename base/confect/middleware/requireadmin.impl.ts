import { MiddlewareImpl } from "@confect/server";
import * as Effect from "effect/Effect";

import RequireAdmin from "./requireadmin.spec";
import { CurrentUser } from "./requireuser.spec";
import databaseSchema from "../_generated/schema";
import { ActionCtx, MutationCtx, QueryCtx } from "../_generated/services";
import { BetterAuth } from "../services/auth/betterauth";

export default MiddlewareImpl.makeByFunctionType(databaseSchema, RequireAdmin, {
	query: Effect.fnUntraced(function* (effect) {
			const ctx = yield* QueryCtx;
			const user = yield* BetterAuth.requireAdmin(ctx);
			return yield* Effect.provideService(effect, CurrentUser, { user });
		}),
	mutation: Effect.fnUntraced(function* (effect) {
			const ctx = yield* MutationCtx;
			const user = yield* BetterAuth.requireAdmin(ctx);
			return yield* Effect.provideService(effect, CurrentUser, { user });
		}),
	action: Effect.fnUntraced(function* (effect) {
			const ctx = yield* ActionCtx;
			const user = yield* BetterAuth.requireAdmin(ctx);
			return yield* Effect.provideService(effect, CurrentUser, { user });
		}),
});
