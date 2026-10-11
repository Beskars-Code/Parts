# Importing Parts

## Select

Inspect the destination first. Read [../base/README.md](../base/README.md) and the README of each selected module. Use the baseline when starting a new app, or merge only the requested conventions into an existing repo.

The runnable base uses Better Auth email/password login and real Convex persistence. Its Effect session boundary remains replaceable; selecting WorkOS requires a real provider/session adapter. The [auth module](../plugins/auth/README.md) supports partial imports. The base also includes fake billing and a themed shader; real Stripe, OpenRouter, and native integrations are selected separately. The [optional Tauri shell](../base/src-tauri/README.md) is a hosted-app template, with destination native setup and platform builds still required.

## Bring over

Copy `base/` contents to the destination root and merge the selected `plugins/<name>/` import sets into their documented paths. Merge `scripts`, dependencies, dev dependencies, and patched dependencies from each package fragment; preserve unrelated destination fields. Copy matching patch files and resolve conflicting versions explicitly.

When renaming the destination package, adapt its [Effect service identifier prefixes](../base/docs/services.md#rename-the-destination) in the same edit so strict deterministic-key diagnostics keep matching the package name.

Create the destination's actual TanStack routes and backend registrations. Regenerate all schemas and function references there. Do not carry Apollo generated code, its application lockfile, credentials, or product data into another project. A plugin's `reference/` directory provides source evidence for adaptation, not finished destination code.

The base includes English-default `use-intl` catalogs, persisted theme selection, and page/theme transitions. Preserve its providers when merging routes and keep persistent app chrome outside `PageTransition`'s named DOM capture. Keep `defaultViewTransition: true` so TanStack owns native page transitions. Copy nested `locales/` catalogs together with their route request functions and server-only registry; client providers consume loader messages. Add [French](../plugins/locales/fr/README.md) only when selected and keep `en` as the default. If adding its optional language control, import both the select and its validated POST locale setter. Maintain unique namespaces, matching files/keys, and the 100-line/8 KiB file and 16 KiB scope budgets through `bun run lint:i18n`.

The [base test layout](../base/tests/README.md) mirrors route and source owners with Vitest and three accepted starter service cases. Copy its guides and config, then retain or add only accepted destination cases. Select [Convex testing](../plugins/testing/convex/README.md) when real backend cases need it. No Apollo product tests or source-text scanning helpers belong in the import set.

## Connect and prove

Follow the [canonical development guide](../base/instructions/development.md) for the full starter. Auth generation precedes Confect generation and the first Convex startup. After selecting/configuring its own development deployment, use `bun run dev:all` only with existing watchers stopped; otherwise start missing individual processes. The guide also owns the separate Convex and application identities and intentionally guarded local or hosted [agent login](../base/instructions/development.md#development-agent-login). Do not overwrite real auth/storage adapters with the plugin's older provider options. Replace one provider through the owning service boundary and preserve authority on public functions.

1. Register chosen backend components, schemas, and public functions.
2. Connect the provider to a shared identity, then apply role, permission, and ownership checks to protected entry points.
3. Connect module commands to the destination configuration and actual APIs.
4. Run the configured static checks and existing test suites without weakening policy to suppress findings.
5. Specialize `verifications/README.md` for the app, map the real features in `verifications/features/`, and execute the imported behavior.
6. Report copied and adapted paths, provider choices, completed checks, and remaining gaps. An imported directory is not proof of an integrated app.

Maintain the plain Markdown runbook and reusable feature recipes in `verifications/`. Keep any owned control scripts with that runbook. Store local run evidence in the separate `.verifications/` directory at the root, outside `docs/`. Do not duplicate the live runbook in architecture documentation.
