import { MiddlewareSpec } from "@confect/core";
import * as Context from "effect/Context";
import * as Schema from "effect/Schema";

import type { AuthUser } from "../services/auth/authuser";

export class CurrentUser extends Context.Service<CurrentUser, { readonly user: AuthUser }>()("apollo-predictions/confect/middleware/requireuser.spec/CurrentUser") {}

export class NotAuthenticated extends Schema.TaggedError<NotAuthenticated>()("NotAuthenticated", { message: Schema.tag("Not authenticated") }) {}

export default class RequireUser extends MiddlewareSpec.MiddlewareSpec<RequireUser, { provides: CurrentUser }>()("RequireUser", {
	error: () => NotAuthenticated,
	functionTypes: { query: true, mutation: true, action: true },
}) {}
