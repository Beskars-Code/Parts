import { createClient } from "@convex-dev/better-auth";
import { betterAuth } from "better-auth/minimal";

import authSchema from "../../../components/betterAuth/schema";
import { components } from "../../_generated/components";
import { baseAuthOptions } from "./options";

import type databaseSchema from "../../_generated/schema";
import type { DataModel as ConfectDataModel } from "@confect/server";
import type { GenericCtx } from "@convex-dev/better-auth/utils";

type DataModel = ConfectDataModel.ToConvex<ConfectDataModel.FromSchema<typeof databaseSchema>>;

export const authComponent: ReturnType<typeof createClient<DataModel, typeof authSchema>> = createClient<DataModel, typeof authSchema>(components.betterAuth, {
	local: {
		schema: authSchema,
	},
	verbose: false,

});

export const { onCreate, onUpdate, onDelete } = authComponent.triggersApi();

export const createAuthOptions = (ctx: GenericCtx<DataModel>) => {
	const resultValue = {
		...baseAuthOptions(),
		database: authComponent.adapter(ctx),
	};
	return resultValue;
};

export const createAuth = (ctx: GenericCtx<DataModel>) => betterAuth(createAuthOptions(ctx));

