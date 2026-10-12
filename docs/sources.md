# Source provenance

The Apollo extraction is pinned to [Beskars-Code/Apollo-Predictions, revision 846503e7fe415f55f8051bdbcc7a5963c25bfdd6](https://github.com/Beskars-Code/Apollo-Predictions/tree/846503e7fe415f55f8051bdbcc7a5963c25bfdd6), fetched from GitHub on 2026-10-11. The user's older, modified local checkout was left untouched.

Localization and test-owner conventions are adapted from [Beskars-Code/Apollo-Labs, revision 6f22d448c3cd1389666362d5a48f360a1b781b9e](https://github.com/Beskars-Code/Apollo-Labs/tree/6f22d448c3cd1389666362d5a48f360a1b781b9e), inspected in a clean GitHub clone. Apollo Labs product messages, cases, and fixtures were not copied.

## Extracted and adapted

| Parts owner | Apollo source | Adaptation |
| --- | --- | --- |
| `base/tooling/lint/` | `.devin/lint/` | General tooling path/name, project-aware runner, removal of Next route-export exceptions |
| Base lint configs | `eslint.config.mjs`, `.oxlintrc.json` | Explicit React/import plugins, removal of Next presets/rules and missing cached-query adapter restrictions, complexity 6 instead of source 5 |
| Base TypeScript | `tsconfig.json` | Preserve strictness and Effect diagnostics; Vite types and app source scope |
| Base manifest | `package.json` | Keep reusable stack/tool versions; replace Next with registry-verified TanStack/Vite packages; separate optional module dependencies |
| Base Knip | `knip.json` | Real TanStack/tooling entries; destination adds adopted registered backend boundaries |
| Base transitions | `src/components/system/layout/page-transition.tsx`, `src/components/system/theme/`, theme provider, transition CSS/tokens | Keep Apollo's page blur and typed theme polygon reveal; adapt its React page wrapper to named DOM capture with TanStack native `defaultViewTransition: true`, move to Parts concern folders, reuse generic `next-themes` 0.4.6 |
| Cookie banner UI part | `src/features/consent/cookie-banner.tsx`, `src/components/system/design-tokens.css` | Preserve floating geometry, typography, and three actions; replace Next Link and Apollo consent context with native controls and explicit callbacks; map colors to destination tokens, pass server-owned English copy, and leave privacy destinations blank. No provider, storage, settings sheets, footer, or policy pages imported |
| Base localization and French module | Apollo Labs `i18n/`, `messages/<locale>/`, `components/layout/language-switcher.tsx`, `scripts/check-i18n.ts` | Use `use-intl` 4.14.1 and typed TanStack route server requests; author nested `locales/` catalogs, server-only imports, English-default scoped payloads, unique namespaces, file/key parity and 100-line/8 KiB file plus 16 KiB scope budgets |
| Test layout and optional Convex test environment | Apollo Labs `tests/`, `vitest.config.ts`, test dependencies | Preserve source-owner placement as nested route/backend/component guides; update runner to Vitest 5.0.3, keep Node in the base and `convex-test`/edge-runtime dependencies optional; include no product cases |
| Auth module | `confect/services/auth/`, auth middleware, Better Auth component, development scripts | Keep development gates and permission contracts; remove Apollo user-profile provisioning; map public env names to Vite |
| Stripe module | `scripts/stripe/`, Stripe mirrors and tables | Destination-owned empty catalog with fail-fast guard, removal of Apollo telemetry dependency, propagate transient retrieval failures |
| Stripe references | Checkout, sync, webhook, subscription schema, billing catalog | Preserve source for adaptation; exclude from the default import set |

`base/patches/` carries Apollo's matching Convex and Effect language-service patches. Module patches cover selected Confect/Better Auth/convex-helpers dependencies. Unused old patch versions were not imported.

## New conventions

Apollo separated `docs/` and `instructions/` but kept a verification document in `docs/`. Parts keeps its verification runbook and feature recipes as plain Markdown under `verifications/`, outside that tree. The guide follows the launch, doctor, drive, evidence, and cleanup sequence inspired by [pstack's verification approach](https://github.com/backnotprop/pstack/blob/main/skills/create-verification-skill/SKILL.md), without packaging the guide as an agent skill. It remains an import template until specialized and exercised in a real app; local run evidence belongs in the separate `.verifications/` directory.

Project agent instructions and folder ownership documentation were authored for Parts. Apollo had no tracked `AGENTS.md` in the pinned snapshot. TanStack/Vite package versions were checked against npm registry metadata, including Start/Router and Vite/React-plugin compatibility.

Apollo Labs' tests mirror source owners such as `app/api/download/`, `convex/`, and `lib/`; Parts keeps that ownership with normalized nested route folders. Vitest 5 replaces source version 3's environment matching with explicit projects when optional Convex tests are installed. The configuration follows the official [Vitest projects API](https://vitest.dev/guide/projects) and [Convex test setup](https://docs.convex.dev/testing/convex-test).

## Limits

Parts is a catalog with a minimal copyable app in `base/`; it has no connected destination backend, production auth credentials, or live Stripe environment. Static template validation does not prove an imported app's login, billing, permission, transition, or locale behavior. WorkOS, Tauri, OpenRouter workflows, and additional custom Convex components remain future modules unless their source is added here. Verify the imported behavior in the destination before calling its integration complete.
