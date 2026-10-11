import { createAuthEndpoint } from "better-auth/api";
import { setSessionCookie } from "better-auth/cookies";
import * as Cause from "effect/Cause";
import * as Effect from "effect/Effect";
import * as Exit from "effect/Exit";

import { assertCloudAgentAccess } from "./access";
import { runAuthSdk } from "./sdk";
import { mintCloudAgentSession } from "./session";

import type { BetterAuthPlugin } from "better-auth";

export function cloudAgentAuthPlugin() {
	return {
		id: "cloud-agent-auth",
		endpoints: {
			cloudAgentSignIn: createAuthEndpoint("/cloud-agent-sign-in", { method: "POST" }, async (context) => {
				const result = await Effect.runPromiseExit(Effect.gen(function* () {
					yield* assertCloudAgentAccess(context.headers);
					const packed = yield* mintCloudAgentSession(context.context.internalAdapter);
					yield* runAuthSdk(() => setSessionCookie(context, packed));
					const response: { readonly ok: true } = { ok: true };
					return response;
				}));
				if (Exit.isFailure(result)) {
					throw Cause.squash(result.cause);
				}
				return result.value;
			}),
		},
	} satisfies BetterAuthPlugin;
}
