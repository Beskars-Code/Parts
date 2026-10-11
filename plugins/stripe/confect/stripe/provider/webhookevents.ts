// Pure module: imported by both confect/stripe/webhook.ts and scripts/stripe/stripe-webhook.mjs.
// Keep free of Convex/Confect imports so Node type-stripping can load it.
export const WEBHOOK_EVENT_TYPES = ["customer.subscription.created", "customer.subscription.updated", "customer.subscription.deleted", "invoice.payment_failed", "checkout.session.completed"] as const;
