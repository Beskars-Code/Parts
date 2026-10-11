import * as FunctionSpec from "@confect/core/FunctionSpec";
import * as GroupSpec from "@confect/core/GroupSpec";
import * as Schema from "effect/Schema";

import RequireUser from "../middleware/requireuser.spec";
import Telemetry from "../middleware/telemetry.spec";

const urlReturn = () => Schema.Struct({ url: Schema.String });

const checkoutSession = FunctionSpec.publicAction({
	name: "createCheckoutSession",
	args: () => ({ returnPath: Schema.optionalKey(Schema.String) }),
	returns: urlReturn,
}).middleware(RequireUser);

const billingPortalSession = FunctionSpec.publicAction({
	name: "createBillingPortalSession",
	args: () => ({ returnPath: Schema.optionalKey(Schema.String) }),
	returns: urlReturn,
}).middleware(RequireUser);

export default GroupSpec.make().middleware(Telemetry).addFunction(checkoutSession).addFunction(billingPortalSession);
