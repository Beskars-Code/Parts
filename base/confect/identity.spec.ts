import { FunctionSpec, GroupSpec } from "@confect/core";
import * as Schema from "effect/Schema";

import { AuthUser } from "./services/auth/authuser";

export default GroupSpec.make().addFunction(FunctionSpec.publicQuery({
	name: "whoAmI", args: () => ({}), returns: () => Schema.NullOr(AuthUser),
}));
