# Base project template

Copy the contents of this directory into a new project root, merge with any existing files, and rename `parts-project` in `package.json` together with the [Effect service identifier prefixes](docs/services.md#rename-the-destination). This starter contains a TanStack todo app with real Convex persistence, Better Auth email/password login, strict permission checks, replaceable Effect services, and visibly fake billing. The example app is small enough to replace with a destination's product.

Agents follow the project [instructions](instructions/README.md). Generate auth and Confect code before the first Convex startup, then create the destination's deployment and configure its environment before starting the web app. The [starter recipe](verifications/features/starter.md) covers the connected user flow.

## Included

- A Bun package manifest and connected todo example for TanStack Start, React, TypeScript, Convex, Better Auth, Confect, Effect, and Tailwind.
- Email/password sign-up and sign-in, owner-scoped task create/rename/complete/delete, and a read-only protected admin panel.
- A free 5-task cap and deterministic mock checkout to the 25-task Pro cap. Every stored task counts, including completed tasks. No Stripe credentials or real charge are involved.
- Effect service contracts for sessions, tasks, accounts, and billing, with real Convex adapters and injectable frontend Layers.
- Vite and Tailwind configuration, strict TypeScript settings, Oxlint, ESLint, Knip, and custom lint rules.
- Browser log and unhandled-error forwarding into the Vite development terminal, with terminal output preserved between updates.
- Editable shadcn-compatible theme tokens, a persisted Light/Dark/System picker, page/theme transitions, and a quiet WebGL shader derived from the same palette.
- English-default `use-intl` messages, typed translation keys, and server-delivered route catalogs adapted from Apollo Labs.
- A [route and owner-based test layout](tests/README.md) with Vitest 5.0.3 and the accepted starter service behavior cases.
- [TesterArmy E2E](instructions/e2e.md) with a Chromium runner and one guarded agent-login case, without model configuration.
- Matching Convex and Effect language-service patches from Apollo.
- Project agent instructions, architecture and design documentation, and a [plain Markdown verification template](verifications/README.md) outside `docs/`.

Real Stripe, OpenRouter, shadcn components, and native integrations remain opt-in. The optional [Tauri 2 source template](src-tauri/README.md) has its own dependency fragment; the web manifest does not install an unused native CLI. The Stripe plugin's checkout and webhook files are adaptation references, while the starter billing provider is a deterministic mock.

## Destination setup

Follow the [development guide](instructions/development.md) for installation, environment setup, and the complete first-run sequence. Generate Better Auth, then Confect, before the first Convex startup; neither generator needs an existing deployment. Keep lockfiles, generated schemas, configuration, and references owned by the destination.

For an already selected development deployment with stopped watchers, `bun run dev:all` generates schemas and starts Convex, Confect, and Vite together. When retaining existing watchers, start only missing individual commands. The guide owns [startup options](instructions/development.md#start-a-configured-development-session) and [intentional development-agent setup](instructions/development.md#development-agent-login). Convex CLI account selection is separate from the Better Auth user who signs into the app.

The root `/` route contains the task app and sign-in form. Its expandable admin panel is a read-only caller identity view on the same screen. The auth proxy owns `/api/auth/$`. A missing Convex configuration produces setup guidance rather than a fake authenticated session or local task store. Browser visibility does not grant backend access.

New users have the `user` role and no admin permission. Provision an admin role and a `system:access` permission equal to `true` through a trusted backend operation for the destination. A role alone does not grant the permission. The development agent login creates its designated admin through the same auth and permission path; keep that bypass unavailable outside development. The starter does not register user or role management endpoints.

## Commands

| Command | Purpose |
| --- | --- |
| `bun run dev:all` | Generate auth/Confect schemas and start owned Convex, Confect, and Vite processes for a configured development deployment |
| `bun run dev:cloud` | Fetch app variables from the selected cloud dev deployment, then start the owned development processes |
| `bun run dev:anonymous` | Seed an owned anonymous backend from `.env.local`, start development, and restore the source file on stop |
| `bun run dev` | Start the destination TanStack app on port 3000 |
| `bun run dev:convex` | Start the destination Convex watcher |
| `bun run dev:confect` | Watch Confect contracts and regenerate destination backend registrations |
| `bun run codegen:auth` | Generate the destination Better Auth schema |
| `bun run codegen:confect` | Generate the destination Confect contracts and references |
| `bun run agent:login` | Provision/sign in and verify the intentionally enabled development application admin on a selected local, anonymous, or hosted dev backend |
| `bun run build` | Build the destination app |
| `bun run preview` | Preview its build |
| `bun run lint` | Run structure and message-catalog checks, Oxlint, full ESLint, and Effect diagnostics for existing source projects |
| `bun run lint:structure` | Check code-file length and direct folder code-file counts |
| `bun run lint:i18n` | Check route catalog ownership, locale key parity, and catalog/payload size limits |
| `bun run lint:fix` | Apply supported lint fixes; diagnostics still fail on remaining errors |
| `bun run typecheck` | Check app TypeScript |
| `bun run knip` | Find unused source, exports, dependencies, and unresolved imports |
| `bun run check` | Run lint, typecheck, and Knip |
| `bun run test` | Run the destination's accepted Vitest cases once |
| `bun run test:e2e` | Run the accepted agent-login case in Chromium against the running development app |

Optional module fragments add commands such as `stripe:check` and `desktop:dev`. Add or extend tests only after the user accepts the specific cases. If a destination removes the example cases, a "No test files found" exit is missing coverage, not a passing suite.

Vite's [browser console forwarding](https://vite.dev/config/server-options#server-forwardconsole) is explicitly enabled for `log`, `info`, `warn`, `error`, and `debug`, plus uncaught errors and unhandled rejections. Agents can read client-side events alongside server logs in the development terminal. The dev server fails if its chosen port is occupied instead of silently moving to another origin.

## Quality policy

The [build/deployment guide](scripts/deployment/README.md) describes `bun run build`, required Convex app variables, source generation, and build environment isolation. Optional Vercel and Cloudflare Workers modules in Parts add `build:vercel` / `build:cloudflare` and explicit `deploy:* --target staging|production --env-file <path>` commands. A plain build never publishes. Import a selected module's static adapter, pinned dependency and Knip fragments, and follow its provider README before claiming hosted runtime support.

Cyclomatic complexity is capped at **6** in ESLint and Oxlint. Both treat violations as errors. Warnings and unused suppression directives fail, and inline lint configuration is disabled. Full ESLint remains a deliberate fallback for rules Oxlint does not cover.

Structure warnings fail too: handwritten code files may have **1,000 physical lines** (including comments and blanks), and folders may contain **8 direct handwritten code files**. Findings tell agents to split by responsibility and organize related files in named subfolders. The structure check always scans the whole project, including on `lint:fix` or Confect-only lint runs; it does not move files automatically.

Code includes JavaScript/TypeScript variants, CSS/SCSS/Sass/Less, Rust, and GLSL/vertex/fragment/WGSL shaders. Docs, JSON configuration, patches, and subdirectories do not count as code files. Generated directories (`_generated`, `__generated__`, `generated`), `.gen.`/`.generated.` filenames, and recognized leading generated comment banners are excluded from both rules. Git metadata and `node_modules` are skipped at every depth. Standard root build/cache output, coverage, `target/`, `src-tauri/target/`, and verification evidence are skipped; nested handwritten concerns such as `scripts/build/` are checked. Keep these exclusions for actual generated/output files; never add a generated marker to handwritten code to silence a warning.

TypeScript is strict, including unchecked indexes, exact optional properties, explicit returns, and unknown catch values. The lint policy rejects unsafe casts, `any`, floating promises, dynamic imports, React effect hooks, result bags, invalid Convex function contracts, nondeterministic queries, and unbounded Confect reads. Accessibility, import ordering, cycles, filenames, and app exports are checked too.

Both linters enforce `standards/no-hardcoded-ui-text` as an error in product `src`; generated source, tests, and tooling are exempt. It rejects literal UI copy in JSX, copy-bearing attributes and metadata, toast calls, and native UI writes, including same-file constant aliases. It recognizes translators created by actual `use-intl` imports: translation keys are allowed, but static text passed as interpolation values is rejected. Technical strings such as routes, CSS classes, identifiers, and internal diagnostics remain allowed outside copy-bearing sinks.

All user-facing copy must be translated, including data beyond the rule's static reach. Present backend errors through structured codes or translation keys and translate them in the UI instead of rendering raw English error strings. Review arbitrary imported data and helper output at their presentation boundaries; the AST rule does not prove that every such flow is translated.

Knip's entry list represents real app routes and tooling boundaries. When adopting Confect or a native Convex component, add only its actual registered spec, implementation, schema, and component entries. Do not mark every service file as an entry or blanket-ignore dependencies to obtain a green result.

The lint runner invokes Effect diagnostics only for source areas that exist. A populated `convex/` needs its destination-generated `convex/tsconfig.json`; Confect uses `tooling/lint/confect-tsconfig.json`. A missing config for existing source fails instead of silently skipping checks.

## Theme

Edit [src/styles.css](src/styles.css) to brand an app. The `:root` block owns the light palette and base radius; its `@variant dark` block owns dark overrides. Shared tokens use shadcn's semantic names, including surface/foreground pairs, primary, secondary, muted, accent, destructive, border, input, ring, charts, and sidebar colors. Tailwind's `@theme inline` exposes utilities such as `bg-background`, `text-foreground`, `bg-primary`, and `rounded-lg`.

The root [ThemeProvider](src/components/theme/theme-provider.tsx) uses `next-themes` 0.4.6 and the shared [theme store](src/components/theme/theme-transition-store.ts). The picker saves Light/Dark/System in localStorage under `theme`. System resolves the OS preference to one `.light` or `.dark` root class and updates when that preference changes. With neither class present, including the server-rendered CSS fallback, the stylesheet and `dark:` variant follow the OS directly. Use [useThemeTransition](src/components/theme/use-theme-transition.ts) for changes instead of setting root classes yourself.

shadcn components remain opt-in. When initializing them, point the CLI at `src/styles.css` with CSS variables enabled and preserve these tokens instead of adding another palette. See the [shadcn theme convention](https://ui.shadcn.com/docs/theming) and [Tailwind custom variants](https://tailwindcss.com/docs/adding-custom-styles#adding-custom-variants).

[ShaderBackground](src/components/shader/shader-background.tsx) mounts a decorative WebGL light field behind the app. It reads `--background` and `--muted-foreground`, follows root theme changes, caps render density, and stops animation in hidden tabs or reduced-motion mode. Its callback-ref cleanup removes listeners/observers and deletes GPU resources. Unsupported WebGL, setup failure, and context loss leave the CSS theme background visible. Keep the shader and persistent chrome outside `PageTransition`.

## Transitions

[PageTransition](src/components/page-transition/page-transition.tsx) wraps the root route's `<Outlet />` in a DOM element with `view-transition-name: page`. The router enables `defaultViewTransition: true`, so TanStack starts the native browser transition when route content changes. The named page snapshot blurs, fades, and scales slightly over 500ms. Keep persistent navigation, sidebars, and other app chrome outside this capture region. TanStack owns page transitions; do not add a second React `ViewTransition` engine around the outlet.

Theme changes use a typed `theme` browser transition and reveal the new root palette through a polygon over 700ms. The direction follows the resolved palette, including OS changes while System is selected. During this transition, CSS suppresses descendant capture names so the page and chrome are one root image. [src/styles/transitions.css](src/styles/transitions.css) owns motion tokens, animations, and still-chrome classes. Reduced motion uses a 120ms opacity-only page fade and immediate theme changes. Unsupported browsers still navigate and change themes without animation. Run the [theme and transition recipe](verifications/features/theme-and-transitions.md) in the destination to prove live behavior.

## Localization

[src/i18n/](src/i18n/config.ts) owns locale metadata, server catalog loading, route request functions, the provider, and `use-intl` type augmentation. English (`en`) is the default and the only installed base locale. Route loaders resolve the `NEXT_LOCALE` cookie against registered locales; missing or unsupported values fall back to English. Their message payloads supply `<html lang>`, translated metadata, and the client provider. Locale-dependent requests use private, uncached responses.

The shared config explicitly uses UTC for formatting on the server and in the browser, avoiding environment-dependent time-zone differences. Set a different explicit product time zone there when the app needs it; keep metadata and client formatting on the same configuration.

Keep UI copy under `locales/<locale>/<route-owner>/`, with concern files inside each route folder. The base has shared catalogs under `locales/en/__root/` and separate concern catalogs under `index/` for tasks, auth, billing, admin, and errors. Each concern owns its namespace; leaf names such as `label` can repeat within different namespaces. Use typed calls such as `useTranslations("theme")` in components. Preserve route groups and `$parameter` names when adding nested route owners.

Runtime catalog imports stay in `.server.ts` modules. UI providers receive messages from loader data instead of importing the catalog registry. The root loads its shared scope; the index route loads its page scope and combines it with the parent messages for its provider. English type augmentation uses type-only imports, which do not bring JSON into the browser bundle. Installing French registers its matching server catalogs; it does not add all languages to the initial client payload.

Follow the [add a translated page instructions](instructions/README.md#add-a-translated-page) when creating a route. Register its English scope, add a request module with a fixed scope, and extend the `use-intl` `AppConfig.Messages` type along with its loader and provider.

Initial SSR carries shell and current-page messages in loader data, with no separate initial browser catalog fetch. Later page navigation requests its page scope. TanStack import protection is configured to fail development/build when server catalog modules or `locales/` JSON enter the client graph; type-only imports remain allowed. Verify that rejection and the actual payload in the destination.

Catalog lint caps each JSON file at 100 physical lines and 8 KiB, and each merged route scope at 16 KiB. It enforces unique namespace ownership and matching files/keys across installed locales. These are source and payload budgets, not a measured speed claim. Check the destination's initial payload and production bundle before claiming the loading path is fast; see the [localization recipe](verifications/features/localization.md).

French is available through `plugins/locales/fr/` in Parts. Copy its documented files and add its `fr` catalog to the registry; keep English as the default. To add its optional language control, copy both `language-select.tsx` and `set-locale.ts`. The control calls a validated POST server function to save the locale cookie, then invalidates the router. Follow the [localization recipe](verifications/features/localization.md) to check SSR, hydration, persisted choice, and missing-locale fallback.

## Tests

[tests/README.md](tests/README.md) defines route and source-owner placement. `/` owns `tests/routes/index/`; `/settings/profile` owns `tests/routes/settings/profile/`. Keep unit and integration cases for one owner together, preserve route groups and dynamic parameter names, and mirror backend/reusable component concerns under `tests/convex/` and `tests/components/`. Shared setup belongs to named concerns under `tests/support/`.

The base runner uses Node and matches `tests/**/*.test.{ts,tsx}`. Its accepted cases exercise the core service boundaries; they do not prove a deployed Convex transport or browser login. Select Parts' `plugins/testing/convex/` only when backend cases use its `convex-test` and edge-runtime dependencies. Keep live browser recipes in `verifications/` and local evidence in `.verifications/`.

## Integration

1. Replace the example feature with the destination's product while keeping its needed service and authority boundaries, and register its own Convex backend. TanStack generates `src/routeTree.gen.ts` when it starts or builds.
2. Select module dependencies and merge their `package.fragment.json` fields and `patches/` into the project. Copy any shared files once and reconcile differences.
3. Install with Bun, then run auth generation followed by Confect generation before the first Convex startup. Let Convex and TanStack generate their deployment references and routes in the destination. The imported package versions and patches are a known source snapshot; upgrade them together deliberately.
4. Configure public `VITE_CONVEX_URL` and `VITE_CONVEX_SITE_URL` from the destination deployment. Keep auth and Stripe secrets on the backend or in private agent process configuration.
5. Run `bun run check`, resolve findings without weakening the policy, and specialize `verifications/README.md` and its feature recipes against the real app. Keep maintained guides in `verifications/` and local run evidence in `.verifications/`.

The app does not inherit Next.js dependencies, configuration, route exceptions, or `NEXT_PUBLIC_` environment names. Source code and its adapters must agree on the destination's Vite names.
