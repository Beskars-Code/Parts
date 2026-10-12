import { createAuthEndpoint } from "better-auth/api";
import { setSessionCookie } from "better-auth/cookies";
import * as Cause from "effect/Cause";
import * as ConfigProvider from "effect/ConfigProvider";
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
				const provider = ConfigProvider.fromEnvRecord({
					ENV: process.env["ENV"], SITE_URL: process.env["SITE_URL"], CLOUD_AGENT_AUTH_SECRET: process.env["CLOUD_AGENT_AUTH_SECRET"],
				});
				const result = await Effect.runPromiseExit(Effect.gen(function* () {
					yield* assertCloudAgentAccess(context.headers);
					const packed = yield* mintCloudAgentSession(context.context.internalAdapter);
					yield* runAuthSdk(() => setSessionCookie(context, packed));
					const response: { readonly ok: true } = { ok: true };
					return response;
				}).pipe(Effect.provideService(ConfigProvider.ConfigProvider, provider)));
				if (Exit.isFailure(result)) {
					throw Cause.squash(result.cause);
				}
				return result.value;
			}),
		},
	} satisfies BetterAuthPlugin;
}
