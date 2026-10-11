import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Schema from "effect/Schema";

import type { TransportError } from "../errors/transport-error";

export const PrincipalId = Schema.String.pipe(Schema.brand("PrincipalId"));
export type PrincipalId = typeof PrincipalId.Type;

export const Principal = Schema.Struct({
	id: PrincipalId, name: Schema.String, email: Schema.String,
	role: Schema.String, permissions: Schema.Record(Schema.String, Schema.Boolean),
});
export type Principal = typeof Principal.Type;

export class NotAuthenticated extends Schema.TaggedError<NotAuthenticated>()("NotAuthenticated", {}) {}
export class AdminAccessRequired extends Schema.TaggedError<AdminAccessRequired>()("AdminAccessRequired", {}) {}
export class MissingPermission extends Schema.TaggedError<MissingPermission>()("MissingPermission", { permission: Schema.String }) {}

export class SessionSource extends Context.Service<SessionSource, {
	readonly current: Effect.Effect<Principal | null, TransportError>;
}>()("parts-project/services/auth/access/SessionSource") {}

export class AccessService extends Context.Service<AccessService, {
	readonly current: Effect.Effect<Principal | null, TransportError>;
	readonly requireUser: Effect.Effect<Principal, NotAuthenticated | TransportError>;
	readonly requireAdmin: (permission: string) => Effect.Effect<Principal, NotAuthenticated | AdminAccessRequired | MissingPermission | TransportError>;
}>()("parts-project/services/auth/access/AccessService") {}

export const AccessServiceLive = Layer.effect(AccessService, Effect.gen(function* () {
	const session = yield* SessionSource;
	const requireUser = session.current.pipe(Effect.flatMap(user => user === null ? Effect.fail(new NotAuthenticated()) : Effect.succeed(user)));
	const requireAdmin = Effect.fnUntraced(function* (permission: string) {
		const user = yield* requireUser;
		if (user.role !== "admin") { return yield* new AdminAccessRequired(); }
		return user.permissions[permission] === true ? user : (yield* new MissingPermission({ permission }));
	});
	return { current: session.current, requireUser, requireAdmin };
}));
