import * as Ref from "@confect/core/Ref";
import { httpActionGeneric } from "convex/server";
import * as Predicate from "effect/Predicate";

import { requireWebhookSecret, stripe } from "./provider/config";
import { WEBHOOK_EVENT_TYPES } from "./provider/webhookevents";
import refs from "../_generated/refs";

import type { GenericActionCtx, GenericDataModel } from "convex/server";
import type Stripe from "stripe";

const ALLOWED_EVENTS: ReadonlySet<string> = new Set(WEBHOOK_EVENT_TYPES);

const jsonResponse = (body: unknown, status: number): Response => Response.json(body, { status });

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null;

const stringField = (value: Record<string, unknown>, key: string): string | undefined => {
	const field = value[key];
	if (typeof field === "string") {
		return field;
	}
	return isRecord(field) && typeof field["id"] === "string" ? field["id"] : undefined;
};

const customerIdFromObject = (object: unknown): string | undefined => (isRecord(object) ? stringField(object, "customer") : undefined);

const invoiceSubscriptionId = (invoice: unknown): string | undefined => {
	if (!isRecord(invoice) || !isRecord(invoice["parent"])) {
		return undefined;
	}
	const details = invoice["parent"]["subscription_details"];
	return isRecord(details) ? stringField(details, "subscription") : undefined;
};

const sessionSubscriptionId = (object: unknown): string | undefined => (isRecord(object) ? stringField(object, "subscription") : undefined);

const subscriptionObjectId = (object: unknown): string | undefined => (isRecord(object) && typeof object["id"] === "string" ? object["id"] : undefined);

const subscriptionIdFromEvent = (event: Stripe.Event): string | undefined => {
	const object: unknown = event.data.object;
	return event.type === "checkout.session.completed" ? sessionSubscriptionId(object) : (event.type === "invoice.payment_failed" ? invoiceSubscriptionId(object) : subscriptionObjectId(object));
};

const signatureErrorMessage = (error: unknown): string => (Predicate.isError(error) ? error.message : "Invalid signature");

const verifySignature = async (request: Request): Promise<Stripe.Event | Response> => {
	const signature = request.headers.get("stripe-signature");
	if (signature === null) {
		return jsonResponse({ error: "No signature found in request" }, 400);
	}
	try {
		return await stripe().webhooks.constructEventAsync(await request.text(), signature, requireWebhookSecret());
	} catch (error) {
		return jsonResponse({ error: `Webhook Error: ${signatureErrorMessage(error)}` }, 400);
	}
};

const isDuplicate = async (ctx: GenericActionCtx<GenericDataModel>, eventId: string): Promise<boolean> => Boolean(await ctx.runQuery(Ref.getFunctionReference(refs.internal.stripe.events.hasEvent), { eventId }));

const syncEventArgs = (event: Stripe.Event) => {
	const subscriptionId = subscriptionIdFromEvent(event);
	const customerId = customerIdFromObject(event.data.object);
	return {
		eventId: event.id,
		type: event.type,
		created: event.created,
		...(subscriptionId === undefined ? {} : { subscriptionId }),
		...(customerId === undefined ? {} : { customerId }),
	};
};

const dispatchEvent = async (ctx: GenericActionCtx<GenericDataModel>, event: Stripe.Event): Promise<void> => {
	await ctx.runAction(Ref.getFunctionReference(refs.internal.stripe.sync.handleEvent), syncEventArgs(event));
	await ctx.runMutation(Ref.getFunctionReference(refs.internal.stripe.events.recordEvent), {
		eventId: event.id,
		type: event.type,
		created: event.created,
	});
};

export const stripeWebhook = httpActionGeneric(async (ctx, request) => {
	const parsed = await verifySignature(request);
	if (parsed instanceof Response) {
		return parsed;
	}
	const event = parsed;

	if (!ALLOWED_EVENTS.has(event.type) || (await isDuplicate(ctx, event.id))) {
		return jsonResponse({ received: true }, 200);
	}

	await dispatchEvent(ctx, event);

	return jsonResponse({ received: true }, 200);
});
