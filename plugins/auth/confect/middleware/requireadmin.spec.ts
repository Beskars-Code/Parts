import { MiddlewareSpec } from "@confect/core";
import * as Schema from "effect/Schema";

import { NotAuthenticated } from "./requireuser.spec";

import type { CurrentUser } from "./requireuser.spec";

export class AdminAccessRequired extends Schema.TaggedError<AdminAccessRequired>()("AdminAccessRequired", { message: Schema.tag("Admin access required") }) {}

export default class RequireAdmin extends MiddlewareSpec.MiddlewareSpec<RequireAdmin, { provides: CurrentUser }>()("RequireAdmin", {
	error: () => Schema.Union([NotAuthenticated, AdminAccessRequired]),
	functionTypes: { query: true, mutation: true, action: true },
}) {}
