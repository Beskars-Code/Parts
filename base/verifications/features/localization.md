# Localization

Run against the copied destination app. The base registers only English (`en`) through `use-intl`; French (`fr`) and a language switcher are installed only when that module is selected. No login or backend data is required.

## Drive

1. With no `NEXT_LOCALE` cookie, request `/` and inspect the server-rendered document. Confirm `lang="en"`, English page title, and English starter/theme labels. Load it in the browser and confirm hydration preserves the same locale without message errors.
2. Set an unsupported locale cookie and reload. Confirm server HTML, title, and client content still resolve to English. In the English-only base, `fr` is unsupported too.
3. Run `bun run lint:i18n`. Confirm nested `locales/<locale>/<route-owner>/` catalogs match English files/keys, own unique namespaces, and stay within 100 physical lines and 8 KiB each, with merged scopes within 16 KiB. Repeated leaf names across different namespaces are valid. Check the development terminal for missing-message, formatting, or environment-fallback errors. Confirm the same explicit time zone (UTC by default) supplies server metadata and client formatting.
4. If French is installed, use the labeled language switcher to select French. Confirm the meaningful result: French copy, document language, and translated title agree. Reload and confirm the `NEXT_LOCALE=fr` choice persists. Switch back to English and confirm the same result and persistence.
5. With French installed, request `/` with a French locale cookie before client JavaScript runs. Confirm the server document is already French and hydrates to the same locale. Confirm locale-dependent responses remain private and uncached.
6. Inspect the production client chunks, initial SSR data, and navigation payloads. Runtime catalog modules and JSON imports must remain server-only. Initial SSR should carry shell/current-page messages without a separate initial browser catalog fetch; normal page navigation should request its page scope. Confirm an English response does not serialize French or unrelated route catalogs. In an isolated validation copy, try a direct runtime import of a `locales/` JSON file from client UI and confirm import protection rejects it during development/build; preserve type-only imports. Record actual transfer/payload sizes and readiness timing before making a speed claim; catalog budgets alone do not prove performance.

## Evidence and recovery

Record installed locales, cookie value, cache policy, server/client document language, title, visible messages, catalog-check result, and scoped payload/bundle evidence under `.verifications/<run>/`. If French is absent, mark French steps as not applicable; do not add it just to run this recipe. A static check alone does not prove SSR, switching, or loading performance.

Restore the previous locale cookie. Stop only processes started by this run and preserve the named evidence.
