import * as Ref from "@confect/core/Ref";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

import refs from "../../../../confect/_generated/refs";
import { AdminService } from "../../../../services/admin/service";
import { SessionSource } from "../../../../services/auth/access";
import { BillingService } from "../../../../services/billing/service";
import { TransportError } from "../../../../services/errors/transport-error";
import { TodoService } from "../../../../services/todos/service";

import type { ConvexReactClient } from "convex/react";

function invoke<Reference extends Ref.Any>(
	ref: Reference,
	args: Ref.Args<Reference>,
	call: (reference: Ref.FunctionReference<Reference>) => PromiseLike<unknown>,
) {
	return Ref.runWithCodec(ref, args, reference => call(reference), () => new TransportError({ message: "Backend request failed" }))
		.pipe(Effect.catchTag("SchemaError", () => Effect.fail(new TransportError({ message: "Backend response could not be decoded" }))));
}

export class ConvexServices {
	public readonly todos;
	public readonly billing;
	public readonly admin;
	public readonly session;

	public readonly subscribe = (onChange: () => void) => {
		const watches = [
			this.client.watchQuery(Ref.getFunctionReference(refs.public.todos.list)),
			this.client.watchQuery(Ref.getFunctionReference(refs.public.billing.billing.getPlan)),
			this.client.watchQuery(Ref.getFunctionReference(refs.public.identity.whoAmI)),
		];
		const unsubscribes = watches.map(watch => watch.onUpdate(onChange));
		return () => { for (const unsubscribe of unsubscribes) { unsubscribe(); } };
	};

	public constructor(private readonly client: ConvexReactClient) {
	this.todos = Layer.succeed(TodoService, {
		list: () => invoke(refs.public.todos.list, {}, ref => client.query(ref)),
		create: (title) => invoke(refs.public.todos.create, { title }, ref => client.mutation(ref, { title })),
		rename: (id, title) => invoke(refs.public.todos.rename, { id, title }, ref => client.mutation(ref, { id, title })),
		setCompleted: (id, completed) => invoke(refs.public.todos.setCompleted, { id, completed }, ref => client.mutation(ref, { id, completed })),
		remove: (id) => invoke(refs.public.todos.remove, { id }, ref => client.mutation(ref, { id })),
	});
	this.billing = Layer.succeed(BillingService, {
		getPlan: () => invoke(refs.public.billing.billing.getPlan, {}, ref => client.query(ref)),
		createCheckout: (requestKey) => invoke(refs.public.billing.billing.createCheckout, { requestKey }, ref => client.mutation(ref, { requestKey })),
	});
	this.admin = Layer.succeed(AdminService, {
		overview: invoke(refs.public.admin.admin.overview, {}, ref => client.query(ref)),
	});
	this.session = Layer.succeed(SessionSource, {
		current: invoke(refs.public.identity.whoAmI, {}, ref => client.query(ref)),
	});
	}

}
