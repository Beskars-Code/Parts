import * as Result from "effect/Result";
import * as Schema from "effect/Schema";

import { PrincipalId } from "../../../services/auth/access";

import type { AuthUser } from "./authuser";
import type { Principal } from "../../../services/auth/access";

const permissionMap = Schema.fromJsonString(Schema.Record(Schema.String, Schema.Unknown));

export function toPrincipal(user: AuthUser): Principal {
	const decoded = Schema.decodeUnknownResult(permissionMap)(user.permissions ?? "null");
	const entries = Object.entries(Result.getOrElse(decoded, () => ({})));
	const grants = entries.filter((entry): entry is [string, boolean] => typeof entry[1] === "boolean");
	return {
		id: PrincipalId.make(user._id), name: user.name, email: user.email, role: user.role ?? "user",
		permissions: Object.fromEntries<boolean>(grants),
	};
}
