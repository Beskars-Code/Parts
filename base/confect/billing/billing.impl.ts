import { FunctionImpl, GroupImpl } from "@confect/server";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

import spec from "./billing.spec";
import { BillingService } from "../../services/billing/service";
import schema from "../_generated/schema";
import requireUser from "../middleware/requireuser.impl";
import { BillingReadLive, BillingWriteLive } from "../services/billing/layers";
import { requestRuntime } from "../services/request/runtime";

export default GroupImpl.make(schema, spec).pipe(
	Layer.provide(FunctionImpl.make(schema, spec, "getPlan", () => requestRuntime(BillingService.pipe(Effect.flatMap(service => service.getPlan())), BillingReadLive))),
	Layer.provide(FunctionImpl.make(schema, spec, "createCheckout", ({ requestKey }) => requestRuntime(BillingService.pipe(Effect.flatMap(service => service.createCheckout(requestKey))), BillingWriteLive))),
	Layer.provide(requireUser),
	GroupImpl.finalize,
);
