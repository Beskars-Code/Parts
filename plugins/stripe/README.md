# Code-owned Stripe catalog and billing references

This module brings over Apollo's catalog convergence scripts, Stripe/Convex product and price mirrors, webhook configuration, and source references for checkout and subscription processing. It does not include Apollo's Forecaster business model as the generic billing default.

## Import set

Copy `scripts/`, `confect/`, and `patches/` into the destination and merge `package.fragment.json`. The Confect code requires destination-generated schemas, service bindings, and references; regenerate them after registering the imported tables and spec/implementation groups. Keep the product, price, and event administration functions internal.

`confect/services/billing/catalog.ts` is the project's catalog definition. It starts empty, and setup/check refuse to run until it contains actual project products and prices. Define names, lookup keys, amount in minor currency units, currency, recurring interval, default price, and tax code according to the project's product requirements.

`scripts/development/read-environment.mjs` is shared with the auth module. Import one copy. `@confect/core` and its matching patch are also shared.

## Commands

| Command | Behavior |
| --- | --- |
| `bun run stripe:check` | Read catalog and mirror state and report drift |
| `bun run stripe:setup` | Converge code-owned Stripe products/prices and their Convex mirrors |
| `bun run stripe:webhook:check` | Check webhook configuration |
| `bun run stripe:webhook` | Reconcile the backend webhook endpoint and signing-secret configuration |

Test Stripe keys are required by default. Source scripts support `--allow-live`; use it only for a destination production operation the user explicitly authorized. No Stripe operation runs as part of importing Parts.

## Catalog behavior

The scripts identify products and prices by stable lookup keys. Immutable price changes create replacement prices and transfer lookup keys; outdated prices are archived and mirrors are updated. Setup retires unlisted active prices on each configured product, so those products must be owned by this code catalog. Do not point the catalog at a product whose prices are managed elsewhere.

Extra active Stripe products with lookup keys can be reported as drift but are not automatically archived. Setup also archives stale Convex mirrors. Drift checks consider active mirrors, so retained archived history does not repeatedly fail a check. Product lookup selects an active mirror when an older archived product shares its lookup key. Unlike Apollo's original script, transient price retrieval failures now propagate; only a confirmed 404 is treated as a missing price.

Source API version is pinned in `confect/stripe/provider/apiversion.ts`. Configure `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` on the selected backend. Webhook setup uses `VITE_CONVEX_SITE_URL` or backend `CONVEX_SITE_URL`; public URLs may be frontend-readable, secrets must not have a `VITE_` prefix.

## Checkout and subscription integration

`reference/` preserves Apollo checkout, subscription sync, webhook handling, subscription schema, and its original catalog for understanding their contracts. These files are adaptation references, not part of the import set.

The reference flow authenticates the caller, derives the customer and catalog price on the server, validates relative return paths, creates checkout/portal sessions, verifies webhook signatures over the original request body, filters events, refreshes subscription state, and records processed event IDs. Subscription refresh failures propagate for Stripe retries, and older subscription events are ignored.

To adopt it, replace Apollo user-profile references, product lookup keys, plan mapping, entitlements, and telemetry with the destination's owning services. Register and wire the HTTP webhook and internal sync/event functions before running webhook setup. The frontend calls a billing public operation instead of talking to Stripe or choosing an arbitrary amount/customer.

Two source limitations require destination work before production use: checkout/customer creation lacks creation idempotency keys, and duplicate-event lookup followed by a separate action does not serialize concurrent webhook deliveries. Add an authoritative retry/concurrency contract at the destination's billing boundary; do not describe the reference code as fully retry-safe.

## Verify

After integration, run catalog check in a Stripe test environment. Inspect a planned catalog change before applying it. Prove checkout, portal access, signed webhooks, rejected invalid signatures, repeat delivery, and the resulting subscription/entitlement state through the project's real flow. Maintain those recipes as Markdown in `verifications/` and record local results in the separate `.verifications/` directory, outside `docs/`.
