import * as Effect from "effect/Effect";

import { CheckoutRequestKey } from "../../../services/billing/provider";
import { BillingService } from "../../../services/billing/service";
import { useServiceRequest } from "../../services/application/use-service-request";

export function usePlanUpgrade() {
	const request = useServiceRequest();
	const upgrade = () => {
		const requestKey = CheckoutRequestKey.make(crypto.randomUUID());
		request.run(BillingService.pipe(Effect.flatMap(billing => billing.createCheckout(requestKey))));
	};
	return { upgrade, ...request };
}
