import { FunctionSpec, GroupSpec } from "@confect/core";
import * as Schema from "effect/Schema";

import { Principal } from "../services/auth/access";

export default GroupSpec.make().addFunction(FunctionSpec.publicQuery({
	name: "whoAmI", args: () => ({}), returns: () => Schema.NullOr(Principal),
}));
