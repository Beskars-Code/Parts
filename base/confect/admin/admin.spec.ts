import { FunctionSpec, GroupSpec } from "@confect/core";
import * as Schema from "effect/Schema";

import { Principal, NotAuthenticated, AdminAccessRequired, MissingPermission } from "../../services/auth/access";
import { TransportError } from "../../services/errors/transport-error";
import RequireAdmin from "../middleware/requireadmin.spec";
import RequirePermission from "../middleware/requirepermission.spec";

export default GroupSpec.make().addFunction(FunctionSpec.publicQuery({
	name: "overview", args: () => ({}), returns: () => Principal, error: () => Schema.Union([NotAuthenticated, AdminAccessRequired, MissingPermission, TransportError]),
}).middleware(RequireAdmin).middleware(RequirePermission, { permission: "system:access" }));
