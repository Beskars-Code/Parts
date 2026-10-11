# French locale

Opt-in French for the English-first base. Uses Apollo Labs' namespace and ICU conventions through `use-intl`. Catalogs mirror routes and reach the browser only through active route loaders.

## Import

1. Copy `locales/fr/` into the destination's `locales/fr/`. Translate any English catalogs added since the starter was copied, using matching route folders and filenames.
2. Copy `src/i18n/catalogs/fr.server.ts` into the same destination path. Statically import new French JSON files there and register their route namespaces beside English.
3. In `src/i18n/config.ts`, change the tuple to `const locales = ["en", "fr"] as const;`. Keep English as default.
4. Register French in the server-only `src/i18n/catalogs/catalogs.server.ts`:

   ```ts
   import english from "./en.server";
   import french from "./fr.server";

   import type { Locale } from "../config";

   const catalogs: Record<Locale, typeof english> = { en: english, fr: french };

   export default catalogs;
   ```

5. Optionally copy `src/i18n/set-locale.ts` and `src/components/language/language-select.tsx`, then render `<LanguageSelect />` in the destination's header or settings. Without these files, supported preference cookies still select the locale.
6. Run `bun run check`. `lint:i18n` checks matching catalog paths and keys, namespace ownership within each route scope, and payload limits. TypeScript checks French shapes against English and checks translation keys through English type-only augmentation.

## Catalog layout

```text
locales/fr/
  __root/
    language.json     # language.label
    theme.json        # theme.label, light, dark, system
  index/
    page.json         # home.title, description
```

`__root` contains shared shell copy. Page folders mirror route paths: `index` is `/`, and `/settings/profile` uses `settings/profile/`. Give pages distinct namespaces so leaves such as `title` can repeat. Keep namespace ownership unique within each scope; do not put the same namespace in two sibling files.

Each file stays at most 100 physical lines and 8 KiB of UTF-8 JSON. A route scope stays at most 16 KiB across its files. Split files by copy responsibility. Move copy to `__root` only when it is actually shared.

## Behavior

A supported `NEXT_LOCALE` cookie selects English or French on the server. Invalid or unregistered preferences fall back to English. The root request sends shell messages; the page request sends only its own messages. The page provider explicitly merges the two payloads. Initial HTML, page title, document language, and hydrated copy use the same preference.

The optional select calls a POST server function that validates client-safe locale metadata and writes a one-year cookie. It then invalidates the router, updating the shell and active page without a URL prefix. The control displays locale codes and translates its label through `language.label`.

Do not import server catalogs or locale JSON into components or route loader bodies. Import route request functions instead: `getRootMessages()` loads `__root`, and `getHomeMessages()` loads `index`. Their handlers call typed server-only `loadCatalog(scope)`. TanStack removes catalog imports from browser RPC stubs. Add another route by registering its catalogs and adding a request function under `src/i18n/requests/` that uses its fixed scope.

Adding another language follows the same locale tuple, catalog registration, and translation steps. Account-backed preference persistence belongs to the optional auth integration.

## Verify in the destination

- Switch EN to FR. Check page copy, theme labels, page title, and `<html lang="fr">`.
- Reload and confirm French persists. Switch back to EN and repeat.
- Set an unsupported preference and confirm English renders without a hydration warning.
- Add a temporary inactive-page catalog with unique copy. Confirm homepage HTML and browser bundles omit it. Navigating to that page should load it through that page's request only.
- Run `bun run lint:i18n` after adding, removing, or splitting catalogs.

Maintain project verification guides as Markdown in `verifications/`; place local run evidence in `.verifications/`.
