# Agent jobs

Keep repeatable project operations here, such as importing a module or maintaining the Stripe catalog. A job names its prerequisites, entry command, expected result, and recovery path.

App verification belongs in the plain Markdown runbook under `verifications/`, with feature recipes in `verifications/features/`. Do not create `docs/verification.md` or keep a second copy of the verification runbook here. Local run evidence belongs in the separate `.verifications/` directory.

When importing a Parts module, read its README, merge its package fragment and patches, connect its public entry points, regenerate destination code, then exercise the imported behavior. A copied directory alone is not a completed integration.

The baseline already supplies English `use-intl` catalogs, persisted theme selection, and page/theme transitions. Keep those owners when replacing the starter page. Put copy in nested `locales/<locale>/<route-owner>/` folders, load catalogs through route server functions, and supply providers from loader data. Keep runtime JSON imports server-only. Use `plugins/locales/fr/` from Parts only when French is requested, preserve English as the default, and run `bun run lint:i18n` after catalog changes.

Use [tests/README.md](../tests/README.md) for accepted cases. Keep them with route/backend/component owners rather than splitting one owner across unit/integration/e2e directories. No product cases ship with the runner setup; a no-tests exit is not a passing suite. Convex test dependencies are selected separately when actual backend cases need them.

## Add a translated page

Use the existing [index route](../src/routes/index.tsx), [English registry](../src/i18n/catalogs/en.server.ts), [request module](../src/i18n/requests/index.ts), and [type augmentation](../src/i18n/types.d.ts) as the small working example.

1. Give the route a nested owner path. For `src/routes/settings.profile.tsx`, use `settings/profile`; create `locales/en/settings/profile/page.json` with a distinct namespace such as `settingsProfile`. Keep each catalog within 100 physical lines and 8 KiB and its merged route scope within 16 KiB. If another locale is installed, add the matching file and keys there too.
2. Statically import that catalog into `src/i18n/catalogs/en.server.ts` and add the `"settings/profile"` registry property. Register the equivalent scope in every installed locale's server registry. Namespace ownership must remain unique; leaf keys such as `title` may repeat within different namespaces.
3. Add `src/i18n/requests/settings/profile.ts`. Export a GET `createServerFn` whose handler calls `loadCatalog("settings/profile")`, following `getHomeMessages`. Keep the scope fixed in this server function so its returned messages retain their exact type. Do not expose a generic client-selected catalog scope.
4. Extend `AppConfig.Messages` in `src/i18n/types.d.ts` with `& (typeof english)["settings/profile"]`. Keep the English registry import type-only; runtime JSON and catalog registry imports belong exclusively to server modules.
5. Call the route's request function from its loader. Build metadata with `createTranslator` using that loader's locale, messages, and the shared configured time zone. Merge parent shell messages with page messages for the route's `I18nProvider`, then render the page component below that provider. Use the typed `useTranslations("settingsProfile")` binding for UI copy.
6. Run `bun run lint:i18n` and `bun run check`, then follow the [localization recipe](../verifications/features/localization.md) for SSR, hydration, metadata, and payload boundaries. If the user accepts automated cases, place them at `tests/routes/settings/profile/`.

Preserve route groups and dynamic parameter names in these owner paths. For example, a route owned by `(app)/projects/$projectId` uses `locales/en/(app)/projects/$projectId/`, `src/i18n/requests/(app)/projects/$projectId.ts`, the registry scope `"(app)/projects/$projectId"`, and accepted cases under `tests/routes/(app)/projects/$projectId/`. Keep the literal `$projectId` name instead of substituting an example ID.

Translate all user-facing copy, including backend-derived messages. Return structured codes or translation keys from backend boundaries and translate at presentation; internal diagnostics can remain technical strings. Both lint engines reject known static copy sinks in product `src`, but arbitrary imported data and helper output still require review. Actual `use-intl` translator bindings allow keys; static literal interpolation text must move into the catalog instead.
