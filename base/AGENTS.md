# Project instructions

Use Bun and the scripts in `package.json`. The starter uses TanStack Start, React, TypeScript, Convex, Confect, Effect, and Better Auth email/password login. Keep its real auth/storage boundaries when replacing the todo example, and select optional modules from Parts to fit the project.

## Read first

- [docs/architecture.md](docs/architecture.md): ownership and folder conventions.
- [docs/design.md](docs/design.md): product UI and UX rules.
- [instructions/README.md](instructions/README.md): repeatable agent jobs.
- [verifications/README.md](verifications/README.md): plain Markdown starter recipes; record the destination's setup and real results before calling it verified.
- [tests/README.md](tests/README.md): route and source-owner placement for accepted automated cases.

## Quality

- Cyclomatic complexity is at most 6. Refactor the function instead of raising the cap.
- Handwritten code files have at most 1,000 physical lines, including comments and blank lines. Split oversized files by responsibility.
- A folder has at most 8 direct handwritten code files. Create named subfolders for related concerns and update imports instead of adding arbitrary numbered buckets. Generated files do not count toward either limit.
- No lint warnings, inline suppressions, unsafe casts, `any`, floating promises, or dead code. Knip findings are work to fix.
- Keep one primary app export with supporting types. Domain services may expose cohesive operations. Follow framework-required names and exports.
- Use early returns, static imports, and small functions. Keep domain rules inside their owning service.
- React effect hooks are banned by the inherited lint policy. Prefer event handlers, derived values, key resets, and external-store subscriptions.
- Use the semantic theme tokens in `src/styles.css` for colors and radii. Use `useThemeTransition` for persisted Light/Dark/System choices; the provider owns root classes and the stylesheet supplies the OS fallback before hydration.
- Keep the named page capture around changing route content, with persistent chrome outside. TanStack owns native page transitions through `defaultViewTransition: true`; do not add a second React `ViewTransition` engine. Preserve reduced-motion and unsupported-browser fallbacks.
- English is the default locale. Use typed `use-intl` translations in nested `locales/<locale>/<route-owner>/` catalogs; enable French only when requested. Preserve route groups and `$parameter` names. Keep JSON files within 100 physical lines and 8 KiB, with merged route scopes within 16 KiB; maintain unique namespace ownership and matching files/keys across installed locales.
- Keep runtime catalog imports server-only. Route request functions supply messages through loader data; UI providers consume that payload. Do not import the full locale registry into client components. `bun run lint:i18n` checks catalog policy.
- Preserve TanStack's import-protection errors for `locales/` JSON and server catalog modules in the client graph. Type-only imports are allowed. SSR should deliver shell/current-page messages without a separate initial browser catalog fetch; verify that boundary and payload in the destination.
- Translate every user-facing message, including UI text, attributes, metadata, and toast/native UI messages. Present backend-derived copy through structured codes or translation keys translated in the UI; do not render raw English backend error strings.
- Both linters enforce `standards/no-hardcoded-ui-text` as an error in product `src`, with generated source, tests, and tooling exempt. It follows same-file constant aliases and actual imported `use-intl` translator bindings, allowing keys but rejecting static literal interpolation text. Technical strings are allowed outside copy-bearing sinks. Inspect imported data/helper output at presentation boundaries because static detection cannot prove those arbitrary flows are translated.
- Keep the explicit formatting time zone in `src/i18n/config.ts` shared by server metadata and the client provider. UTC is the base default; choose a product time zone there rather than using each environment's implicit default.
- Public backend entry points enforce identity, role, permission, and ownership. UI guards are feedback.
- Use shared protected query, mutation, and action builders or Confect middleware; do not fork auth checks into every feature.
- Queries are deterministic reads. Mutations own atomic data changes. Actions own external I/O.
- Backend schemas and function contracts use explicit argument and return validators.
- App files use kebab-case. Convex files contain no hyphens or underscores.
- No new tests without the user's acceptance. Existing tests may be run.
- Keep accepted cases with their route or source owner under `tests/`, rather than parallel unit/integration/e2e trees. The base includes three accepted starter service cases; no tests found after removing them is not a passing suite. Use `--passWithNoTests` only for explicit scaffold discovery checks, never as the default or evidence of behavior coverage. Add Convex test dependencies only when real backend cases need that optional module.

## Verify and report

Read running frontend and Convex terminals before launching duplicate processes. Vite forwards all browser console levels and unhandled errors into the development terminal; keep that setting enabled and inspect those logs during verification. Run `bun run check` for the integrated app and the project's existing test suites. Follow `verifications/README.md` to exercise affected real flows; static checks alone do not prove login or billing.

Keep reusable verification instructions as plain Markdown in `verifications/`, including feature recipes and owned scripts. Put local screenshots, logs, and other run evidence in the separate `.verifications/` directory. `docs/` contains maintained product, design, and architecture information.

Do not commit, push, or publish unless the user authorized it. Existing Gabriel skill instructions still apply.
