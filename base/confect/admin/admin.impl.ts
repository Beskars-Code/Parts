import { FunctionImpl, GroupImpl } from "@confect/server";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

import spec from "./admin.spec";
import { AdminService, AdminServiceLive } from "../../services/admin/service";
import schema from "../_generated/schema";
import requireAdmin from "../middleware/requireadmin.impl";
import requirePermission from "../middleware/requirepermission.impl";
import { AccessLive } from "../services/auth/session";
import { requestRuntime } from "../services/request/runtime";

const adminLive = AdminServiceLive.pipe(Layer.provide(AccessLive));

export default GroupImpl.make(schema, spec).pipe(
	Layer.provide(FunctionImpl.make(schema, spec, "overview", () => requestRuntime(AdminService.pipe(Effect.flatMap(service => service.overview)), adminLive))),
	Layer.provide(requireAdmin),
	Layer.provide(requirePermission),
	GroupImpl.finalize,
);
