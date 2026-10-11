import { convex } from "@convex-dev/better-auth/plugins";
import { admin } from "better-auth/plugins";

import authConfig from "../../auth";
import { cloudAgentAuthPlugin } from "./cloudagent/plugin";

import type { BetterAuthOptions } from "better-auth/minimal";

// Keep this module independent of generated references: schema generation runs first.
export function baseAuthOptions() {
	const siteUrl = process.env["SITE_URL"];
	return {
		appName: "Parts project",
		...(siteUrl === undefined ? {} : { baseURL: siteUrl }),
		secret: process.env["BETTER_AUTH_SECRET"],
		emailAndPassword: { enabled: true },
		user: {
			additionalFields: {
				permissions: { type: "json", required: false, defaultValue: {}, input: false },
			},
			deleteUser: { enabled: true },
		},
		plugins: [
			admin({ defaultRole: "user", adminRoles: ["admin"] }),
			convex({ authConfig }),
			cloudAgentAuthPlugin(),
		],
	} satisfies BetterAuthOptions;
}
