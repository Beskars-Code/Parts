import { Stripe } from "stripe";

import { STRIPE_API_VERSION } from "./apiversion";

export function stripe(): Stripe {
	const secretKey = process.env["STRIPE_SECRET_KEY"];
	if (secretKey === undefined || secretKey === "") {
		throw new Error("STRIPE_SECRET_KEY is not defined in environment variables");
	}
	return new Stripe(secretKey, {
		apiVersion: STRIPE_API_VERSION,
		typescript: true,
	});
}

export function requireWebhookSecret(): string {
	const secret = process.env["STRIPE_WEBHOOK_SECRET"];
	if (secret === undefined || secret === "") {
		throw new Error("STRIPE_WEBHOOK_SECRET is not defined in environment variables");
	}
	return secret;
}
