import { MiddlewareSpec } from "@confect/core";
import * as Schema from "effect/Schema";

import type { CurrentUser } from "./requireuser.spec";

export class MissingPermission extends Schema.TaggedError<MissingPermission>()("MissingPermission", { permission: Schema.String, message: Schema.String }) {}

export default class RequirePermission extends MiddlewareSpec.MiddlewareSpec<RequirePermission, { requires: CurrentUser }>()("RequirePermission", {
	options: () => Schema.Struct({ permission: Schema.String }),
	error: () => MissingPermission,
	functionTypes: { query: true, mutation: true, action: true },
}) {}
