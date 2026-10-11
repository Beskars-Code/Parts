import * as Context from "effect/Context";
import * as Schema from "effect/Schema";

import type { PrincipalId } from "../auth/access";
import type { TransportError } from "../errors/transport-error";
import type * as Effect from "effect/Effect";

export const Account = Schema.Struct({ plan: Schema.Literals(["free", "pro"]), todoCount: Schema.Number });
export type Account = typeof Account.Type;

export class AccountStore extends Context.Service<AccountStore, {
	readonly read: (ownerId: PrincipalId) => Effect.Effect<Account, TransportError>;
	readonly write: (ownerId: PrincipalId, account: Account) => Effect.Effect<void, TransportError>;
}>()("parts-project/services/billing/account-store/AccountStore") {}
