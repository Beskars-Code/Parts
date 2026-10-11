import * as Result from "effect/Result";
import * as Schema from "effect/Schema";

import type { AuthUser } from "./authuser";

export function hasPermission(user: Pick<AuthUser, "permissions"> | null | undefined, permission: string): boolean {
	const granted = Schema.fromJsonString(Schema.Struct({ [permission]: Schema.Literal(true) }));
	return Result.isSuccess(Schema.decodeUnknownResult(granted)(user?.permissions ?? "null"));
}
