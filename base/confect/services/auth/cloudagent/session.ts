import { APIError } from "better-auth/api";
import * as Effect from "effect/Effect";

import { runAuthSdk } from "./sdk";

import type { setSessionCookie } from "better-auth/cookies";

type AuthAdapter = Parameters<typeof setSessionCookie>[0]["context"]["internalAdapter"];

const ensureAgent = Effect.fnUntraced(function* (adapter: AuthAdapter) {
	const existing = yield* runAuthSdk(() => adapter.findUserByEmail("cloud-agent@localhost"));
	if (existing === null) {
		const createAgent = () => adapter.createUser({
				email: "cloud-agent@localhost",
				name: "Cloud Agent",
				emailVerified: true,
				role: "admin",
				permissions: { "system:access": true },
			});
		return yield* runAuthSdk(createAgent);
	}
	const user = existing.user;
	return yield* runAuthSdk(() => adapter.updateUser(user.id, { role: "admin", permissions: { "system:access": true } }));
});

export const mintCloudAgentSession = Effect.fnUntraced(function* (adapter: AuthAdapter) {
	const user = yield* ensureAgent(adapter);
	const session = yield* runAuthSdk(() => adapter.createSession(user.id));
	const packed = yield* runAuthSdk(() => adapter.findSession(session.token));
	return yield* packed === null ? Effect.fail(new APIError("UNAUTHORIZED")) : Effect.succeed(packed);
});
