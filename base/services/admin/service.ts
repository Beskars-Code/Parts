import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

import { AccessService } from "../auth/access";

import type { Principal, NotAuthenticated, AdminAccessRequired, MissingPermission } from "../auth/access";
import type { TransportError } from "../errors/transport-error";

export class AdminService extends Context.Service<AdminService, {
	readonly overview: Effect.Effect<Principal, NotAuthenticated | AdminAccessRequired | MissingPermission | TransportError>;
}>()("parts-project/services/admin/service/AdminService") {}

export const AdminServiceLive = Layer.effect(AdminService, AccessService.pipe(Effect.map(
	access => ({ overview: access.requireAdmin("system:access") }))));
