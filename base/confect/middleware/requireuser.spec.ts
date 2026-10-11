import { MiddlewareSpec } from "@confect/core";
import * as Context from "effect/Context";

import { NotAuthenticated } from "../../services/auth/access";

import type { AuthUser } from "../services/auth/authuser";

export class CurrentUser extends Context.Service<CurrentUser, { readonly user: AuthUser }>()("parts-project/confect/middleware/requireuser.spec/CurrentUser") {}

export default class RequireUser extends MiddlewareSpec.MiddlewareSpec<RequireUser, { provides: CurrentUser }>()("RequireUser", {
	error: () => NotAuthenticated,
	functionTypes: { query: true, mutation: true, action: true },
}) {}
