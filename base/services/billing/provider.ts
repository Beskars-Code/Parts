import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Schema from "effect/Schema";

import type { PrincipalId } from "../auth/access";
import type { TransportError } from "../errors/transport-error";

export const CheckoutId = Schema.String.pipe(Schema.brand("CheckoutId"));
export type CheckoutId = typeof CheckoutId.Type;
export const CheckoutRequestKey = Schema.String.pipe(Schema.brand("CheckoutRequestKey"));
export type CheckoutRequestKey = typeof CheckoutRequestKey.Type;
export const CheckoutReceipt = Schema.Struct({ id: CheckoutId, plan: Schema.Literal("pro"), mode: Schema.Literals(["mock", "live"]) });
export type CheckoutReceipt = typeof CheckoutReceipt.Type;

export class BillingProvider extends Context.Service<BillingProvider, {
	readonly checkout: (ownerId: PrincipalId, requestKey: CheckoutRequestKey) => Effect.Effect<CheckoutReceipt, TransportError>;
}>()("parts-project/services/billing/provider/BillingProvider") {}

export const MockBillingProviderLive = Layer.succeed(BillingProvider, {
	checkout: (ownerId, requestKey) => Effect.succeed({
		id: CheckoutId.make(`mock:${encodeURIComponent(ownerId)}:${encodeURIComponent(requestKey)}`), plan: "pro", mode: "mock",
	}),
});
