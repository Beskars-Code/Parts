import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

import { AccountStore } from "../../../services/billing/account-store";
import { MutationCtx, QueryCtx } from "../../_generated/services";

import type { PrincipalId } from "../../../services/auth/access";
import type { Account } from "../../../services/billing/account-store";

const readAccount = (ctx: QueryCtx | MutationCtx, ownerId: PrincipalId) => Effect.promise(async () => {
	const row = await ctx.db.query("accounts").withIndex("by_owner", q => q.eq("ownerId", ownerId)).unique();
	return { plan: row?.plan ?? "free", todoCount: row?.todoCount ?? 0 };
});

export const AccountStoreReadLive = Layer.effect(AccountStore, QueryCtx.pipe(Effect.map(ctx => ({
	read: (ownerId: PrincipalId) => readAccount(ctx, ownerId),
	write: () => Effect.die(new Error("Account writes require a mutation context")),
}))));

export const AccountStoreWriteLive = Layer.effect(AccountStore, MutationCtx.pipe(Effect.map(ctx => ({
	read: (ownerId: PrincipalId) => readAccount(ctx, ownerId),
	write: (ownerId: PrincipalId, account: Account) => Effect.promise(async () => {
		const row = await ctx.db.query("accounts").withIndex("by_owner", q => q.eq("ownerId", ownerId)).unique();
		if (row === null) {
			await ctx.db.insert("accounts", { ownerId, ...account });
			return;
		}
		await ctx.db.patch(row._id, account);
	}),
}))));
