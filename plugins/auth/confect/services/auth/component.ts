import { createClient } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { betterAuth } from "better-auth/minimal";
import { admin } from "better-auth/plugins";

import authSchema from "../../../components/betterAuth/schema";
import { components } from "../../_generated/components";
import authConfig from "../../auth";
import { cloudAgentAuthPlugin } from "./cloudagent/plugin";

import type databaseSchema from "../../_generated/schema";
import type { DataModel as ConfectDataModel } from "@confect/server";
import type { GenericCtx } from "@convex-dev/better-auth/utils";
import type { BetterAuthOptions } from "better-auth/minimal";

type DataModel = ConfectDataModel.ToConvex<ConfectDataModel.FromSchema<typeof databaseSchema>>;

const SITE_URL = process.env["SITE_URL"];
const BETTER_AUTH_SECRET = process.env["BETTER_AUTH_SECRET"];

export const authComponent: ReturnType<typeof createClient<DataModel, typeof authSchema>> = createClient<DataModel, typeof authSchema>(components.betterAuth, {
	local: {
		schema: authSchema,
	},
	verbose: false,

});

export const { onCreate, onUpdate, onDelete } = authComponent.triggersApi();

/**
Better Auth options for Convex.
Organization / teams remain plug-ready later.
*/
const baseAuthOptions = () => {
	const googleClientId = process.env["GOOGLE_CLIENT_ID"];
	return {
		appName: "Parts project",
		...(SITE_URL === undefined ? {} : { baseURL: SITE_URL }),
		secret: BETTER_AUTH_SECRET,
		emailAndPassword: {
			enabled: false,
		},
		socialProviders: {
			google: {
				clientId: googleClientId ?? [],
				clientSecret: process.env["GOOGLE_CLIENT_SECRET"],
				accessType: "offline",
				prompt: "select_account consent",
			},
		},
		user: {
			additionalFields: {
				permissions: {
					type: "json",
					required: false,
					defaultValue: {},
					input: false,
				},
			},
			deleteUser: {
				enabled: true,
			},
		},
		plugins: [
			admin({
				defaultRole: "user",
				adminRoles: ["admin"],
			}),
			convex({ authConfig }),
			cloudAgentAuthPlugin(),
		],
	} satisfies BetterAuthOptions;
};

export const createAuthOptions = (ctx: GenericCtx<DataModel>) => {
	const resultValue = {
		...baseAuthOptions(),
		database: authComponent.adapter(ctx),
	};
	return resultValue;
};

export const createAuth = (ctx: GenericCtx<DataModel>) => betterAuth(createAuthOptions(ctx));

export const createSchemaAuth = () => betterAuth(baseAuthOptions());
