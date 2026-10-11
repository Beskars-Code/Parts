import { FunctionSpec, GroupSpec } from "@confect/core";
import * as Schema from "effect/Schema";

import { NotAuthenticated } from "../../services/auth/access";
import { CheckoutReceipt, CheckoutRequestKey } from "../../services/billing/provider";
import { PlanSummary, InvalidCheckoutRequest } from "../../services/billing/service";
import { TransportError } from "../../services/errors/transport-error";
import RequireUser from "../middleware/requireuser.spec";

export default GroupSpec.make()
	.addFunction(FunctionSpec.publicQuery({ name: "getPlan", args: () => ({}), returns: () => PlanSummary, error: () => Schema.Union([NotAuthenticated, TransportError]) }).middleware(RequireUser))
	.addFunction(FunctionSpec.publicMutation({ name: "createCheckout", args: () => ({ requestKey: CheckoutRequestKey }), returns: () => CheckoutReceipt, error: () => Schema.Union([NotAuthenticated, InvalidCheckoutRequest, TransportError]) }).middleware(RequireUser));
