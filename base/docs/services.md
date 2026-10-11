# Replaceable services

The todo starter keeps framework-independent behavior in root `services/`. Backend Confect handlers and frontend adapters call those public contracts. Product components do not call Better Auth or Convex directly.

## Rename the destination

When changing `package.json.name` from `parts-project`, replace the `parts-project/` prefix in all ten handwritten Effect service identifier literals with the new package name plus `/`. Find them under `services/`, `src/services/`, and `confect/`; keep each existing owner-file and class suffix. For example, `parts-project/services/todos/service/TodoService` becomes `my-app/services/todos/service/TodoService` when the package is named `my-app`.

The strict `deterministicKeys` diagnostic derives each identifier from the package name, relative owner file, and service class. Renaming only the manifest leaves stale keys and fails diagnostics. Keep that diagnostic enabled and run `bun run check` after adapting the destination. Regenerate destination outputs rather than editing or copying generated service identifiers.

## Core boundaries

- `services/auth/access.ts`: `SessionSource.current` supplies `Principal | null`. `AccessServiceLive` builds signed-in, exact-role, and strict permission checks from that session.
- `services/todos/store.ts`: `TodoStore` supplies `list`, `get`, `insert`, `rename`, `setCompleted`, and `remove`. `TodoServiceLive` owns title validation, caller ownership, and the plan cap.
- `services/billing/account-store.ts`: `AccountStore.read` and `write` persist the account plan and stored task count. The Convex adapters keep task/count changes in one mutation.
- `services/billing/provider.ts`: `BillingProvider.checkout` receives a server-derived owner and request key. `MockBillingProviderLive` returns a deterministic mock receipt. It makes no external payment call.

Feature callers use `TodoService`, `BillingService`, and `AdminService`. The external tags above are the replacement points for a different provider or an injected mock. Confect adapters live in `confect/services/`; public registrations still enforce server identity and authority.

For example, a caller can supply a signed-out session without changing the access service:

```ts
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { AccessService, AccessServiceLive, SessionSource } from "./services/auth/access";

const signedOut = Layer.succeed(SessionSource, { current: Effect.succeed(null) });
const access = AccessServiceLive.pipe(Layer.provide(signedOut));
const principal = await Effect.runPromise(
  AccessService.pipe(Effect.flatMap(service => service.current), Effect.provide(access)),
);
// principal is null. requireUser would fail with NotAuthenticated.
```

The imports in this example are relative to a file at the destination root. Use the corresponding relative paths from another owner.

To run real task behavior with injected storage, build `AccessServiceLive` with a `SessionSource` Layer; build `BillingServiceLive` with that access Layer, an `AccountStore` Layer, and a `BillingProvider` Layer; then provide those dependencies and a `TodoStore` Layer to `TodoServiceLive`. The accepted service cases use this composition. Mock external I/O, retain the real ownership/count/cap logic, and keep each fixture's data scoped to its scenario.

`AccountStore` and `TodoStore` do not supply a transaction for arbitrary adapters. The live Convex mutation supplies that atomic boundary. A replacement persistent adapter must preserve atomic task/count changes before it can replace the backend store.

Task, owner, checkout, and retry identifiers are branded strings. Construct fixture values with `PrincipalId.make` from `services/auth/access.ts`, `TaskId.make` from `services/todos/service.ts`, and `CheckoutId.make` / `CheckoutRequestKey.make` from `services/billing/provider.ts`. For example, `PrincipalId.make("preview-user")` and `TaskId.make("preview-task")` remain distinct types even though both contain strings. Adapt real provider values at their existing validated boundaries; do not replace brands with casts.

## Frontend runtime

`src/services/application/application-provider.tsx` owns the frontend runtime. `ApplicationProvider` accepts `client`, `initialToken`, and optional `layers`. Override keys are `auth`, `todos`, `billing`, `admin`, and `session`. Each value is a fully supplied Effect Layer for its tag; `auth` uses the browser `AuthService` from `src/services/auth/auth-service.ts`, while the other tags come from root `services/`.

For a partial override, keep the existing `ConvexReactClient` and initial token. For example, this Layer replaces the frontend plan service while other services stay connected:

```tsx
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { CheckoutId, CheckoutRequestKey } from "./services/billing/provider";
import { BillingService } from "./services/billing/service";
import { ApplicationProvider } from "./src/services/application/application-provider";

const billing = Layer.succeed(BillingService, {
  getPlan: () => Effect.succeed({ id: "pro", limit: 25, todoCount: 0, mode: "mock" }),
  createCheckout: () => Effect.succeed({ id: CheckoutId.make("preview"), plan: "pro", mode: "mock" }),
});

const requestKey = CheckoutRequestKey.make("preview-upgrade");
const checkout = BillingService.pipe(Effect.flatMap(service => service.createCheckout(requestKey)));
// Run the scenario's checkout through its supplied Layer.
await Effect.runPromise(checkout.pipe(Effect.provide(billing)));

// Keep the existing client, initialToken, and children from the app shell.
<ApplicationProvider client={client} initialToken={initialToken} layers={{ billing }}>
  {children}
</ApplicationProvider>;
```

This is a presentation scenario, not a backend entitlement grant: task writes through the real backend still enforce its stored plan. Supply a consistent complete scenario when testing a whole workflow.

For a backend-free preview, supply all five Layers and set `client={null}` and `initialToken={null}`. The injected `SessionSource` drives the signed-in display; injected auth, task, billing, and admin services handle their own operations. Successful commands refresh the injected reads. With a real client, backend subscriptions also trigger those same reads, so an injected service is not bypassed by a direct UI query.

Keep injected Layers stable across renders, and keep mock state scoped to the scenario. A preview Layer is explicit application setup, never a silent fallback when live configuration is missing.

## Provider changes

A WorkOS adapter replaces session resolution and browser/server auth integration while preserving `Principal` and server permission checks. It is not implemented in this starter.

The [development guide](../instructions/development.md#development-agent-login) describes the guarded agent sign-in that provisions the designated application admin. Convex CLI account selection and application users are separate identities; real user and admin authority still comes from Better Auth and the protected backend functions.

A real Stripe adapter can use the existing `mock | live` checkout-receipt and plan-summary modes. The included `BillingServiceLive` still reports the demonstration's `mock` mode, so a live integration must supply truthful plan reads and its checkout operation together. Return an upgraded entitlement only after the authoritative payment/subscription result, connect signed webhooks and entitlement sync, then exercise checkout, replay, and plan-limit behavior in the destination. The `plugins/stripe/reference/` files in Parts are adaptation evidence, not a production adapter. Preserve the existing service callers wherever their product operations remain valid.
