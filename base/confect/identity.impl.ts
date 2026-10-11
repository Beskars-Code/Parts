import { FunctionImpl, GroupImpl } from "@confect/server";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

import schema from "./_generated/schema";
import { QueryCtx } from "./_generated/services";
import spec from "./identity.spec";
import { BetterAuth } from "./services/auth/betterauth";

export default GroupImpl.make(schema, spec).pipe(
	Layer.provide(FunctionImpl.make(schema, spec, "whoAmI", () => Effect.flatMap(QueryCtx, BetterAuth.getUser))),
	GroupImpl.finalize,
);
