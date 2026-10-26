# Start a project from Parts

This is the Markdown entry point for a coding agent to start, extend, or run a project from Parts. The agent interviews the developer, connects the chosen parts, and verifies the result. It works through the agent's existing tools; no installer binary or application LLM setup is required.

## Invoke

Give your agent the path to this guide and a request such as:

```text
Follow <path-to-Parts>/instructions/start-project.md.
Start a project in <destination-path>. Ask me which Parts I need, explain
the tradeoffs, then set up and verify the choices I make. Do not publish it.
```

For an existing repository, replace the second line with `Add the Parts I choose to this project, preserving its existing stack and work.` To run an already configured project, say `Start this project's development environment using its existing selection.`

## Agent contract

- Inspect before asking. Reuse the user's stated choices and facts from the destination. Do not repeat questions about choices already settled.
- Ask concrete questions with a recommendation and its reason. A displayed default or silence is not an answer. Batch independent choices; ask dependent questions after their prerequisites are known.
- Finish the selection before installing, copying, changing configuration, or creating a deployment. A complete set of answers plus the user's setup request authorizes the agreed work; do not add another generic approval question.
- Keep credentials out of the interview, logs, and source. Use a private secret input when supported, or ask the developer to set values privately in the destination or provider. Never ask them to paste secrets into chat.
- Read each selected part's README. Describe an adaptation reference or planned integration honestly; do not call it an installed capability because its files were copied.
- Preserve the destination's unrelated work. Do not commit, push, publish, or deploy without explicit authorization.

## 1. Inspect the source and destination

Read the destination's instructions, files, package manifest, and Git state. Read [the base guide](../base/README.md), [importing guide](../docs/importing.md), and each selected module's README. Reuse choices already supplied by the user.

Determine whether the request is a new project, selected imports into an existing project, or only starting an installed project. Resolve the Parts checkout and destination paths. If the destination was not supplied, ask for it before treating the current directory as the app. Parts itself is a catalog, not the destination application.

For a new project, settle its name, destination, purpose, and initial scope. Offer the connected todo starter when the developer only wants a foundation; ask what first screen replaces it when they request a product-specific starter. Do not turn a one-screen setup into an unspecified full product build.

For an existing project, inspect its framework, services, package versions, instructions, and Git state. Recommend compatible selected imports. If applying the full base would replace its framework or existing owners, explain the actual conflict and settle that choice before editing. Never overwrite a working app to make it resemble the base.

If the request is only to start an installed project, read its development guide and selected environment. Reuse the configured target, inspect existing watchers, and start only missing processes. Ask about cloud versus anonymous development only when the target is unresolved or the user wants to change it. Skip the module interview and copy steps; continue with the real startup result and handoff.

Explain the baseline once before the module interview: a new full-base project already includes TanStack Start, React, real Convex persistence, Better Auth email/password, permissions, mockable Effect services, a read-only admin panel, fake billing, themed shaders, English, strict tooling, three accepted service tests, and the model-free TesterArmy login case. Do not present included features as separate installation choices.

## 2. Grill the missing choices

Use these question topics only when relevant and unresolved. Keep supplied requirements outside the questions, and prune choices that do not fit the inspected destination. Ask for missing project context first; then batch the independent part choices. Follow an answer with a concrete example or additional question only when it leaves a consequential ambiguity.

An initial question can be: `What should this project do, what should it be called, and where should I create it?` Omit any field the user already supplied. If the destination is populated, resolve merge versus a separate new directory before offering a full-base installation.

The module round uses this shape, with recommendations adjusted to the actual project:

```markdown
## Questions
Reply like: 1a 2a 3a 4a 5a 6a 7a

1. Where should development data live?
   - a) Anonymous local Convex, no Convex account needed, recommended for a local first run.
   - b) Cloud Convex dev, requires your own account and selected development project.

2. What billing should the starting app use?
   - a) Keep the visibly fake demo billing, no real charges, recommended until payments are needed.
   - b) Integrate real Stripe in test mode, including checkout and webhook entitlement handling.

3. Which languages should the app support?
   - a) English only, already included, recommended unless French is needed.
   - b) English and French, with the French catalogs and language switcher.

4. Which application targets do you need?
   - a) Browser app only, recommended for the simplest start.
   - b) Add Tauri 2 and name the desktop/mobile platforms. Its starter shell uses the hosted app server.

5. Which hosting adapter should I prepare?
   - a) Decide later, recommended when the host is not selected.
   - b) Vercel SSR.
   - c) Cloudflare Workers SSR.

6. Should I include the cookie banner UI part?
   - a) Leave it out, recommended unless the app needs consent UI.
   - b) Include it with blank policy links and connect the app's consent/settings behavior.

7. Should I enable guarded development-agent login?
   - a) Leave it disabled; report the bundled login E2E as unrun, recommended unless agent access is wanted.
   - b) Enable it on the selected development backend and run the model-free login E2E.
```

The sample reply shows the format, not a required subset. Ask the developer to answer every displayed unresolved choice or state their own choice in plain language. Do not accept the recommendations on their behalf.

Real Stripe, Tauri, and consent UI need destination-specific integration. Ask the dependent questions after selection: the actual payment plans, native platforms/server strategy, or consent storage/settings owner. A Tauri shell is not an offline packaged app. The cookie banner does not implement tracking controls by itself. Selecting a host authorizes preparing its adapter, not publishing an account or deployment.

When the developer wants a visual direction, offer [DitherCN styling](../ui/dithercn/README.md) for dithered backgrounds, chart fills, text, or images. Settle the treatment and placement before installing it. This is an optional upstream integration reference; it requires destination shadcn setup and source adaptation and is not included in the base.

WorkOS, OpenRouter, shadcn components, and other absent modules are separate implementation requests, not ready installation choices. Explain what exists and what still needs to be built if the developer requests one. Optional [Convex test support](../plugins/testing/convex/README.md) is selected only when accepted backend cases need it; propose specific new cases before writing them, not a blanket test category.

When choices are complete, announce a separate `Locked in (tell me if this is wrong)` summary: destination/name, new versus merge, initial screen, selected development mode, included and excluded parts, agent access, required private setup, and concrete completion checks. Include only relevant fields. Keep that selection in the conversation and reuse it during setup; do not create a hidden plan or questionnaire file in the destination.

## 3. Create or merge the base

For selected imports into an existing app, retain its package name, package manager, framework, and setup commands. Skip the full-base instructions in this section and continue with the selected parts in section 4. Read their prerequisites, adapt package fragments to the existing manager's supported dependency and patch configuration, and regenerate only their destination-owned outputs. If a required runtime, patch mechanism, or backend conflicts with that app, resolve the concrete conflict before installing it; do not silently migrate the stack or discard a required patch.

The remaining steps in this section apply to an agreed full-base destination:

For an empty destination, copy maintained `base/` source, including dotfiles and patches, into its root. Exclude private environment files, another application's lockfiles, installed dependencies, generated code, backend state, build/cache output, and verification evidence. Regenerate destination outputs. For an existing project, merge only the agreed compatible owners and preserve unrelated work. Do not create the new app inside Parts or copy the Parts root's `.git`, `plugins/`, or provenance docs into the app.

Rename the manifest's `parts-project` name together with its [Effect service identifier prefixes](../base/docs/services.md#rename-the-destination), then adapt the app title and starter page for the project. Initialize Git only if the destination has no repository. Install with the manifest's Bun version, applying its matching patches. Create the destination's own lockfile and retain it there.

Change home title/copy in `locales/en/index/page.json` and theme/language labels in `locales/en/__root/`. English is the default. Add route-owned catalogs and request functions for new pages, deliver messages through loader data, and keep runtime catalog imports server-only. Preserve the shared providers and named page capture when replacing starter routes.

The base includes the TanStack router, task and expandable admin panels on `/`, an auth proxy route, Tailwind stylesheet, registered Better Auth component, Confect task/account schemas and functions, strict tooling, docs, and agent instructions. The UI shows setup guidance until its own real backend is configured. Stripe credentials are not needed for the visibly fake upgrade.

Follow the [canonical development setup](../base/instructions/development.md): generate Better Auth then Confect before the first backend startup, select the destination deployment, and configure its own frontend/backend settings. Convex CLI account selection and the app's Better Auth users are separate. Once the development deployment is configured and existing watchers are stopped, use `bun run dev:all`; retain existing processes by starting only the missing individual commands instead. Keep all generated outputs local to the destination. Do not invent a deployment URL or reuse another app's credentials.

Apply the selected development branch, without silently switching it after a failure:

- Anonymous: supply the destination's private `.env.local` seed with `SITE_URL` and `BETTER_AUTH_SECRET`, then run `bun run dev:anonymous`. No Convex account or cloud deploy key is needed. The canonical guide owns local port checks, seed filtering, and restoration on stop.
- Cloud: use `bun run dev:convex` to create/select the destination's own development deployment when needed, then stop that watcher before the aggregate. Configure required app variables on that Convex backend and run `bun run dev:cloud`; it pulls the selected backend's app variables into the destination's `.env.local`.
- Already configured: `bun run dev:all` uses the active development target. Reuse running watchers rather than launching duplicate aggregates.

Keep auth secrets and agent credentials outside frontend prefixes. Variables beginning `NEXT_`, `PUBLIC_`, or `VITE_` reach frontend code; other app variables stay server-side. Reuse the existing environment owners and names instead of inventing another app URL or secret alias. Missing private setup is a concrete blocker, not a reason to substitute mock authentication.

Enable development-agent access only when selected, following [its canonical guard](../base/instructions/development.md#development-agent-login). It requires backend `ENV=dev`, a loopback frontend `SITE_URL`, and a matching private `CLOUD_AGENT_AUTH_SECRET`. Do not expose the bypass outside development or borrow another app's account. The base guide, rather than older partial-import auth examples, owns this starter's actual provider and agent-login behavior.

Keep Vite's browser console forwarding enabled. Read browser logs and unhandled errors from the dev terminal while driving the app; the chosen port must match the browser and auth origin.

## 4. Add only the selected parts

| Selection | Agent action |
| --- | --- |
| Better Auth, permissions, agent admin login | Already connected in the base; configure its own backend and optional development agent secret. Use [plugins/auth/](../plugins/auth/README.md) for partial imports, and reconcile rather than overwrite the base's email/password options |
| WorkOS | Implement the selected provider's real Convex/session integration while preserving the shared identity and permission boundary; a finished WorkOS module is not present in Parts yet |
| Stripe | Merge [plugins/stripe/](../plugins/stripe/README.md), define the project catalog, register internal mirrors, and adapt checkout/subscription/webhook references to the project's billing service |
| French | Follow [plugins/locales/fr/](../plugins/locales/fr/README.md), copy its catalog, and register `fr`; optionally copy the language select together with its POST locale setter; keep `en` as the default |
| Convex tests | Follow [plugins/testing/convex/](../plugins/testing/convex/README.md) only when accepted backend cases need its dependencies and edge-runtime project |
| Tauri | Adopt [the optional shell](../base/src-tauri/README.md), merge its command/dependency fragment, supply destination-owned icons, and keep the live server dependency explicit |
| Vercel | Follow [plugins/deployment-vercel/](../plugins/deployment-vercel/README.md), merging its matching adapter, dependency, patch, and configuration fragments; verify the destination build before any separately authorized publishing |
| Cloudflare Workers | Follow [plugins/deployment-cloudflare/](../plugins/deployment-cloudflare/README.md), merging its Workers SSR adapter, dependency and named target configuration; this is not a static Pages export |
| Cookie banner | Follow [ui/cookie-banner/](../ui/cookie-banner/README.md), copy its renderer/styles/English catalog, keep policy links blank, and connect the selected destination consent/settings owner |
| DitherCN styling | Follow [ui/dithercn/](../ui/dithercn/README.md), configure destination shadcn if needed, install only selected upstream items, and adapt their source to the existing theme, structure limits, SSR, and accessibility requirements |
| shadcn, AI, another component | Inspect source and provider instructions, install only selected dependencies, and implement the destination integration; report absent Parts modules explicitly |

For each available module, merge `package.fragment.json` fields and copy its patches and import set. Reconcile shared files once. Keep `reference/` source out of the app until its product dependencies have been replaced. Extend Knip's real runtime entries for newly registered backend modules without exempting ordinary services.

## 5. Verify the integrated project

For a full-base destination, run `bun run build`, `bun run check`, and its existing test suites. For selected imports into an existing app, run that app's documented install, build, static-check, and test commands with its own package manager, plus the selected module's applicable checks. Do not assume a `check` script exists or switch package managers to make the base's command list fit. Report a missing check as a gap and use the actual configured tools where available. Resolve warnings, complexity above 6, dead code, and type errors without relaxing the agreed rules. Do not add tests without the user's acceptance.

In the full base, `check` also rejects handwritten code files above 1,000 physical lines and folders above 8 direct handwritten code files. Split by responsibility and group files in named subfolders, then update imports. Generated code is excluded from both counts. Keep the semantic theme in `src/styles.css`; edit its light/dark palettes for the new app and reuse their token utilities.

The full base's catalog lint is included in `check`: keep nested `locales/<locale>/<route-owner>/` JSON files within 100 physical lines and 8 KiB, with each merged route scope within 16 KiB. Preserve unique namespaces and matching files/keys across installed locales; repeated leaf names in different namespaces are valid. When these features are present, drive the [theme/transition](../base/verifications/features/theme-and-transitions.md) and [localization](../base/verifications/features/localization.md) recipes, including scoped payload inspection, reduced motion, reload, SSR language, and any installed French switcher. Keep `defaultViewTransition: true` for TanStack's native page transitions and the named capture around the outlet.

Use the [test owner guide](../base/tests/README.md) when adding accepted cases. The starter includes three accepted service cases. If the destination removes them, a "No test files found" exit is missing coverage, not a pass. Never generate product cases just to make that command green. Keep route cases together under `tests/routes/<route>/` and mirror backend/component owners in their folders.

For a full-base project, `bun run test` runs the service cases. When guarded agent access was selected, also run `bun run test:e2e` against the running app using [the E2E setup](../base/instructions/e2e.md). That guide owns the supported Node runtime, Chromium installation, Windows guidance, and private report behavior. The bundled case signs in as the real seeded agent; it does not configure a model. When access was left disabled, record the E2E case as intentionally unrun, not passed. Run retained suites for selected imports into an existing app as well.

For a new full-base app, specialize the plain Markdown runbook at `verifications/README.md`. For selected imports, extend the existing app's verification owner without replacing it. Discover actual routes and operations, document their launch/doctor/drive/evidence/cleanup steps, then exercise the capabilities actually installed. A full-base app follows the [startup and agent-login recipe](../base/verifications/features/development-startup.md) when that access was selected; agent login must establish the real development admin session under the [documented guard](../base/instructions/development.md#development-agent-login). Starter billing checks confirm a visibly fake upgrade and stored plan/count state; adopted real Stripe checks use test mode and confirm checkout/webhook entitlement results.

Keep the maintained Markdown runbook, feature recipes, and any owned scripts in `verifications/`. Put local evidence in the separate `.verifications/` directory, outside `docs/`. Stop only processes created by this run and remove private login files after use.

## 6. Hand off

Report the destination, copied/adapted modules, chosen providers, build/static/live check results, and any integration gaps. Preserve existing shipping authorization; do not publish a new repo, commit, or push merely because scaffolding is complete.

Give the exact next command and where to run it, the actual browser URL when the app is running, and any remaining private setup. Distinguish connected and verified capabilities, adaptation work still needed, planned integrations, and unrun checks. Stop only processes owned by the setup run when cleanup was requested or the verification run ends; do not stop the developer's existing watchers.

## Example request

```text
Follow Parts/instructions/start-project.md. Create a new app in
<destination-path> using the base stack and strict tooling. Ask me which
parts I need before changing files. Then connect and verify my selections,
and report any remaining setup without committing, pushing, or deploying.
```
