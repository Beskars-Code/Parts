import * as Layer from "effect/Layer";

import { AccountStoreReadLive, AccountStoreWriteLive } from "./account-store";
import { MockBillingProviderLive } from "../../../services/billing/provider";
import { BillingServiceLive } from "../../../services/billing/service";
import { AccessLive } from "../auth/session";

export const BillingReadLive = BillingServiceLive.pipe(Layer.provide(Layer.mergeAll(AccessLive, AccountStoreReadLive, MockBillingProviderLive)));
export const BillingWriteLive = BillingServiceLive.pipe(Layer.provide(Layer.mergeAll(AccessLive, AccountStoreWriteLive, MockBillingProviderLive)));
