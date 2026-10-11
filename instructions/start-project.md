# Start a project from Parts

Use this job when asked to create a new repo from Parts or add selected Parts modules to an existing repo. The deliverable is a connected destination project with verified selected capabilities.

## 1. Inspect and select

Read the destination's instructions, files, package manifest, and Git state. Read [the base guide](../base/README.md), [importing guide](../docs/importing.md), and each selected module's README. Reuse choices already supplied by the user.

Select the project directory, name, and needed capabilities. Ask only about a consequential choice that cannot be resolved from the request or repo. The runnable starter includes Better Auth email/password login, real Convex storage, shared Effect services, demonstrated billing, and a theme-derived shader. WorkOS requires a destination adapter. Real Stripe, native CLI/integrations, AI, and further Convex components are opt-in.

## 2. Create the base repo

For an empty destination, copy all `base/` contents, including dotfiles, into its root. For an existing project, merge compatible files and preserve unrelated work. Do not create the new app inside Parts or copy the Parts root's `.git`, `plugins/`, or provenance docs into the app.

Rename the manifest's `parts-project` name together with its [Effect service identifier prefixes](../base/docs/services.md#rename-the-destination), then adapt the app title and starter page for the project. Initialize Git only if the destination has no repository. Install with the manifest's Bun version, applying its matching patches. Create the destination's own lockfile and retain it there.

Change home title/copy in `locales/en/index/page.json` and theme/language labels in `locales/en/__root/`. English is the default. Add route-owned catalogs and request functions for new pages, deliver messages through loader data, and keep runtime catalog imports server-only. Preserve the shared providers and named page capture when replacing starter routes.

The base includes the TanStack router, task and expandable admin panels on `/`, an auth proxy route, Tailwind stylesheet, registered Better Auth component, Confect task/account schemas and functions, strict tooling, docs, and agent instructions. The UI shows setup guidance until its own real backend is configured. Stripe credentials are not needed for the visibly fake upgrade.

Follow the [canonical development setup](../base/instructions/development.md): generate Better Auth then Confect before the first backend startup, select the destination deployment, and configure its own frontend/backend settings. Convex CLI account selection and the app's Better Auth users are separate. Once the development deployment is configured and existing watchers are stopped, use `bun run dev:all`; retain existing processes by starting only the missing individual commands instead. Keep all generated outputs local to the destination. Do not invent a deployment URL or reuse another app's credentials.

Keep Vite's browser console forwarding enabled. Read browser logs and unhandled errors from the dev terminal while driving the app; the chosen port must match the browser and auth origin.

## 3. Add selected modules

| Selection | Agent action |
| --- | --- |
| Better Auth, permissions, agent admin login | Already connected in the base; configure its own backend and optional development agent secret. Use [plugins/auth/](../plugins/auth/README.md) for partial imports, and reconcile rather than overwrite the base's email/password options |
| WorkOS | Implement the selected provider's real Convex/session integration while preserving the shared identity and permission boundary; a finished WorkOS module is not present in Parts yet |
| Stripe | Merge [plugins/stripe/](../plugins/stripe/README.md), define the project catalog, register internal mirrors, and adapt checkout/subscription/webhook references to the project's billing service |
| French | Follow [plugins/locales/fr/](../plugins/locales/fr/README.md), copy its catalog, and register `fr`; optionally copy the language select together with its POST locale setter; keep `en` as the default |
| Convex tests | Follow [plugins/testing/convex/](../plugins/testing/convex/README.md) only when accepted backend cases need its dependencies and edge-runtime project |
| Tauri | Adopt [the optional shell](../base/src-tauri/README.md), merge its command/dependency fragment, supply destination-owned icons, and keep the live server dependency explicit |
| shadcn, AI, another component | Inspect source and provider instructions, install only selected dependencies, and implement the destination integration; report absent Parts modules explicitly |

For each available module, merge `package.fragment.json` fields and copy its patches and import set. Reconcile shared files once. Keep `reference/` source out of the app until its product dependencies have been replaced. Extend Knip's real runtime entries for newly registered backend modules without exempting ordinary services.

## 4. Verify the integrated project

Run `bun run build`, `bun run check`, and all existing project test suites. Resolve warnings, complexity above 6, dead code, and type errors without relaxing the rules. Do not add tests without the user's acceptance.

`check` also rejects handwritten code files above 1,000 physical lines and folders above 8 direct handwritten code files. Split by responsibility and group files in named subfolders, then update imports. Generated code is excluded from both counts. Keep the semantic theme in `src/styles.css`; edit its light/dark palettes for the new app and reuse their token utilities.

Catalog lint is included in `check`: keep nested `locales/<locale>/<route-owner>/` JSON files within 100 physical lines and 8 KiB, with each merged route scope within 16 KiB. Preserve unique namespaces and matching files/keys across installed locales; repeated leaf names in different namespaces are valid. Drive the [theme/transition](../base/verifications/features/theme-and-transitions.md) and [localization](../base/verifications/features/localization.md) recipes, including scoped payload inspection, reduced motion, reload, SSR language, and any installed French switcher. Keep `defaultViewTransition: true` for TanStack's native page transitions and the named capture around the outlet.

Use the [test owner guide](../base/tests/README.md) when adding accepted cases. The starter includes three accepted service cases. If the destination removes them, a "No test files found" exit is missing coverage, not a pass. Never generate product cases just to make that command green. Keep route cases together under `tests/routes/<route>/` and mirror backend/component owners in their folders.

Specialize the plain Markdown runbook at `verifications/README.md` for the new app. Discover actual routes and operations, fill its launch/doctor/drive/evidence/cleanup steps and the recipes in `verifications/features/`, then exercise the starter and selected modules. Follow the [startup and agent-login recipe](../base/verifications/features/development-startup.md); agent login must establish the real development admin session under the [documented guard](../base/instructions/development.md#development-agent-login). Starter billing checks confirm a visibly fake upgrade and stored plan/count state; adopted real Stripe checks use test mode and confirm checkout/webhook entitlement results.

Keep the maintained Markdown runbook, feature recipes, and any owned scripts in `verifications/`. Put local evidence in the separate `.verifications/` directory, outside `docs/`. Stop only processes created by this run and remove private login files after use.

## 5. Hand off

Report the destination, copied/adapted modules, chosen providers, build/static/live check results, and any integration gaps. Preserve existing shipping authorization; do not publish a new repo, commit, or push merely because scaffolding is complete.

## Example request

```text
Start a new repo from Parts/base in this directory. Use the base stack and
strict tooling. Add Better Auth, permissions, agent admin login, and Stripe.
Keep Tauri out for now. Connect and verify the selected modules, then report
any remaining setup without pushing.
```
