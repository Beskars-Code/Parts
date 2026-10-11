import { MiddlewareSpec } from "@confect/core";
import * as Schema from "effect/Schema";

import { AdminAccessRequired, NotAuthenticated } from "../../services/auth/access";

import type { CurrentUser } from "./requireuser.spec";

export default class RequireAdmin extends MiddlewareSpec.MiddlewareSpec<RequireAdmin, { provides: CurrentUser }>()("RequireAdmin", {
	error: () => Schema.Union([NotAuthenticated, AdminAccessRequired]),
	functionTypes: { query: true, mutation: true, action: true },
}) {}
