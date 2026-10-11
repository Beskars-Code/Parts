# Working in Parts

Parts contains templates and optional modules for other repositories. It does not need a running application. Read [README.md](README.md) and the selected module's README before changing or importing it.

- `base/` is copied into a destination root; it is not a workspace application.
- `plugins/<name>/` owns its source, package fragment, patches, and integration instructions.
- `reference/` inside a plugin is source evidence that still requires adaptation. Never copy it wholesale as a finished integration.
- Preserve the user's stack and strict rules. The cyclomatic cap is 6 in both linters.
- Keep handwritten code files at most 1,000 physical lines and folders at most 8 direct handwritten code files. Split by responsibility and concern, update imports, and exclude generated files. Run `node base/tooling/lint/structure/check.mjs` from Parts to check its templates and modules.
- Keep maintained app verification guides as plain Markdown in `verifications/`, outside `docs/`. Keep local run evidence in the separate `.verifications/` directory.
- Keep translation catalogs in nested `locales/<locale>/<route-owner>/` folders. English is the base locale; French is opt-in. Enforce the 100-line/8 KiB file and 16 KiB route-scope budgets, and keep runtime catalog imports server-only.
- Keep accepted automated cases under route and source-owner folders in `tests/`. The template provides runner setup and placement guides, not product tests.
- Never copy generated files, credentials, Apollo product data, or lockfiles from a different application.
- Import module dependencies and their matching patches together. Regenerate destination schemas and function references.
- Report which pieces are implemented templates, integration references, or still planned. Verify the imported behavior in the destination before calling it complete.

Existing Gabriel skill instructions still apply. These are Parts-specific additions.
