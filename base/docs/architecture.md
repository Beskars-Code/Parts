# Architecture

## Ownership

Routes connect the app shell to features. Features own their UI and user-facing orchestration. Shared components own presentation. Services own reusable domain behavior behind small public APIs. A feature calls a service's public API instead of reaching into its vendor adapter or database helpers.

Convex owns authoritative backend state and public function registration. The starter uses `confect/` for typed contracts, implementations, backend adapters, middleware, and table schemas. Framework-independent Effect services live under root `services/`; both the backend and frontend consume those contracts. Generated files belong to the destination and are never imported from Parts. Root `components/` owns independently registered Convex components, while `src/components/` owns UI components.

```text
src/
  routes/                     TanStack file routes; routing glue
  features/<feature>/         Feature entry, UI and orchestration
    components/               Private UI collaborators
    hooks/                    Private UI hooks when needed
  components/                 Shared UI, including shadcn components
    page-transition/          Named DOM capture for native route transitions
    theme/                    Persisted theme selection and typed theme transitions
    shader/                   Decorative theme-derived WebGL renderer and lifecycle
  i18n/                       Locale metadata, providers, and translation types
    catalogs/                 Server-only catalog imports and loading
    requests/                 Route-specific server functions, mirroring route owners
  pages/<page>/               Page UI below its loader-delivered message provider
  styles/                     Shared page and theme transition CSS
  services/application/       Frontend Effect runtime, injected Layers and subscriptions
  services/auth/              Browser and server Better Auth adapters
  router.tsx                  Router entry; included in the base
convex/                       Convex configuration and registered functions
services/<domain>/            Framework-independent Effect services and external dependency tags
confect/                      Typed backend contracts and implementations
  services/<domain>/          Convex and Better Auth adapters for shared dependency tags
  middleware/                User, admin and permission authority
  tables/                    Table schemas and indexes
components/<component>/       Optional native Convex components
src-tauri/                    Optional Tauri shell, hosted-server build and command fragment
scripts/<concern>/            Development and integration commands
tooling/lint/                 Shared lint policy and custom rules
tooling/i18n/                 Namespace, key-parity, and catalog-size checks
locales/<locale>/<route>/     Route-owned JSON catalogs; 100 lines/8 KiB per file
tests/routes/<route>/         Cases owned by a route; nested groups and parameters
tests/convex/<concern>/       Backend cases mirroring their source owners
tests/components/<concern>/   Reusable UI cases mirroring their source owners
tests/support/<concern>/      Shared setup used by actual cases
docs/                        Product, architecture and UI decisions
instructions/                 Repeatable agent jobs
verifications/                Plain Markdown verification runbook and feature recipes
.verifications/               Local run evidence, ignored by Git
```

Create each concern's folder when it has code. This tree is a placement contract; empty directories and generated stubs are unnecessary.

Handwritten code files have at most 1,000 physical lines (comments and blanks included), and folders have at most 8 direct handwritten code files. Split files by responsibility and group related files into named subfolders. Update imports and framework registrations after a move. Generated files and subdirectories do not contribute to a folder's count.

## Backend boundaries

Queries read indexed, bounded data and return the same result for the same stored state. Mutations enforce authority and change facts that must stay consistent together. Actions perform external I/O and call authorized data operations.

Better Auth email/password sessions resolve to a shared `Principal`. `SessionSource` owns that provider boundary and `AccessService` owns signed-in/admin/permission checks. Public task mutations derive their owner from the caller and enforce ownership in `TodoService`; callers do not supply an owner to impersonate. The admin query requires the exact admin role and a permission value exactly equal to `true`.

`TodoStore` and `AccountStore` adapt the core service operations to Convex. Task changes and their stored account count happen in the same Convex mutation. The count includes every stored task, so completion does not release a slot and deletion does. Backend reads use indexed, bounded task lists and the stored count.

Stripe credentials, prices, customer ownership, and entitlement updates remain backend-owned. Browser requests express a product operation; the server determines the authorized customer and catalog price.

The included `BillingProvider` is the deterministic `MockBillingProviderLive`. It changes the stored plan without a payment. Free and Pro task limits live in `services/billing/catalog.ts`. Checkout receipts and plan summaries support `mock | live` modes; the starter service still reports `mock`. A real Stripe integration must provide authoritative checkout/entitlement sync and truthful plan reads together. The Stripe plugin's references are source material for that adaptation. See [services.md](services.md) for public operations and Layer injection.

## Theme and locale boundaries

Route-specific server functions under `src/i18n/requests/` use `load-catalog.server.ts` to resolve the preference cookie and load a typed message scope. Runtime JSON imports remain in `catalogs/*.server.ts`; client components import only locale metadata and types. The base installs English alone. `I18nProvider` consumes loader-delivered `{ locale, messages }`, with an explicit shared UTC time zone. The root owns shared theme/language messages; the index route loads its home messages and combines parent messages for its page provider. Metadata uses the same route payload, and page UI lives below that provider in `src/pages/home/`.

`locales/<locale>/<route-owner>/` mirrors route ownership, retaining group and dynamic parameter names. JSON files own distinct namespaces such as `theme`, `language`, and `home`; leaf keys may repeat across those namespaces. Catalog lint enforces matching files and keys across installed locales, unique namespace ownership, a 100-line/8 KiB file limit, and a 16 KiB merged route-scope limit. Adding French registers matching server catalogs. Its optional select and validated POST locale setter are imported together. Product services do not own language detection.

Initial SSR serializes the shell and current-page scopes; providers use that loader data without an extra initial browser catalog fetch. Ordinary page navigation loads its page scope. TanStack import protection rejects `locales/` JSON and `.server.ts` runtime modules in the client graph during development/build while allowing type-only imports. Keep this guard enabled and prove the scoped payload and rejection in the destination.

`ThemeProvider` and `useThemeTransition` own persisted Light/Dark/System selection. The theme store resolves OS and cross-tab changes, guards obsolete updates, and starts typed theme transitions. `src/styles.css` owns the palettes and pre-hydration OS fallback; `src/styles/transitions.css` owns animation behavior. `PageTransition` wraps `<Outlet />` in a named DOM capture. TanStack's `defaultViewTransition: true` starts native page transitions; no React `ViewTransition` engine is mounted around the outlet. Persistent app chrome belongs outside the page capture. Typed theme transitions suppress descendant capture names and animate the complete root snapshot.

## Extending the foundation

Add an adapter where a provider actually varies, and keep the public domain operation stable. Keep related collaborators together. Avoid `utils/` dumps, pass-through layers, product-specific billing rules in shared auth code, and copied domain logic across features.

## Test ownership

Follow [the test guide](../tests/README.md): `/` maps to `tests/routes/index/`, and `/settings/profile` to `tests/routes/settings/profile/`. Keep route groups and `$parameter` names in nested folders. Unit and integration cases stay together under their owner; backend and reusable component cases mirror their source concerns. The starter supplies Vitest configuration, placement guides, and three accepted cases that execute the real core service logic with injected external dependencies. Select the optional Convex testing module only when accepted backend cases use it.
