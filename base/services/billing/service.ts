import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Schema from "effect/Schema";

import { AccountStore } from "./account-store";
import { plans } from "./catalog";
import { BillingProvider } from "./provider";
import { AccessService } from "../auth/access";

import type { CheckoutReceipt, CheckoutRequestKey } from "./provider";
import type { NotAuthenticated } from "../auth/access";
import type { TransportError } from "../errors/transport-error";

export const PlanSummary = Schema.Struct({
	id: Schema.Literals(["free", "pro"]), limit: Schema.Number, todoCount: Schema.Number, mode: Schema.Literals(["mock", "live"]),
});
export type PlanSummary = typeof PlanSummary.Type;
export class InvalidCheckoutRequest extends Schema.TaggedError<InvalidCheckoutRequest>()("InvalidCheckoutRequest", {}) {}

export class BillingService extends Context.Service<BillingService, {
	readonly getPlan: () => Effect.Effect<PlanSummary, NotAuthenticated | TransportError>;
	readonly createCheckout: (requestKey: CheckoutRequestKey) => Effect.Effect<CheckoutReceipt, NotAuthenticated | InvalidCheckoutRequest | TransportError>;
}>()("parts-project/services/billing/service/BillingService") {}

export const BillingServiceLive = Layer.effect(BillingService, Effect.gen(function* () {
	const access = yield* AccessService;
	const accounts = yield* AccountStore;
	const provider = yield* BillingProvider;
	const getPlan = Effect.fnUntraced(function* (): Effect.fn.Return<PlanSummary, NotAuthenticated | TransportError> {
		const user = yield* access.requireUser;
		const account = yield* accounts.read(user.id);
		return { id: account.plan, limit: plans[account.plan].limit, todoCount: account.todoCount, mode: "mock" };
	});
	const createCheckout = Effect.fnUntraced(function* (requestKey: CheckoutRequestKey) {
		const user = yield* access.requireUser;
		if (requestKey.trim().length === 0 || requestKey.length > 200) { return yield* new InvalidCheckoutRequest(); }
		const account = yield* accounts.read(user.id);
		const receipt = yield* provider.checkout(user.id, requestKey);
		yield* accounts.write(user.id, { ...account, plan: receipt.plan });
		return receipt;
	});
	return { getPlan, createCheckout };
}));
