import { MiddlewareImpl } from "@confect/server";
import * as Effect from "effect/Effect";

import RequirePermission, { MissingPermission } from "./requirepermission.spec";
import { CurrentUser } from "./requireuser.spec";
import databaseSchema from "../_generated/schema";
import { hasPermission } from "../services/auth/permissions";

export default MiddlewareImpl.make(databaseSchema, RequirePermission, Effect.fnUntraced(function* (effect, { options: { permission } }) {
		const { user } = yield* CurrentUser;
		if (!hasPermission(user, permission)) {
			return yield* new MissingPermission({
				permission,
				message: `Missing permission: ${permission}`,
			});
		}
		return yield* effect;
	}));
