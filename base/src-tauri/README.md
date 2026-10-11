# Optional Tauri 2 shell

This is a desktop shell template. Development opens the existing TanStack Start server at `http://localhost:3000`. A release opens the deployed HTTPS app chosen through the existing `SITE_URL` setting. The app needs its TanStack server, Convex, and network access. This shell does not package an offline static build.

Tauri supports a remote URL for [`build.frontendDist`](https://v2.tauri.app/reference/config/#frontenddist) and merges a JSON override supplied through [`--config`](https://v2.tauri.app/reference/cli/). `hosted-build.mjs` validates `SITE_URL` and supplies that override. The Rust build script rejects release builds that omit it or point somewhere else. The placeholder URL in the tracked configuration is never a release target.

## Adopt

1. Install the [native prerequisites](https://v2.tauri.app/start/prerequisites/) for the destination's operating system. Rust and native compilation were not verified in Parts.
2. Merge `package.fragment.json` into the destination manifest, then install with Bun. The web starter does not install the Tauri CLI or JavaScript native APIs when this option is unused.
3. Rename the Cargo package/library, the matching reference in `src/main.rs`, `identifier`, product name, and window title for the destination. Treat the native window title as destination-owned copy if the app has multiple locales.
4. Supply destination-owned `icons/icon.png` and `icons/icon.ico`. Tauri's context generator and Windows resources need them even before installer bundling. No bitmap icons or another app's icons are imported here.
5. Add `src-tauri/hosted-build.mjs` as a real command entry in the destination's Knip configuration. Keep generated `src-tauri/gen/` and Cargo `target/` files out of the handwritten-source checks and Git.

## Run

Start the web and Convex watchers first. Keep the web port fixed at 3000, then run `bun run desktop:dev` in another terminal. There is no `beforeDevCommand` that starts a duplicate server.

For a release, deploy and verify the web app first. Set `SITE_URL` in the build process to that HTTPS URL and run `bun run desktop:build`. Use the same app origin for Better Auth's backend `SITE_URL`; the release WebView uses that origin's session flow. The command does not deploy the server, install native tools, or start a local backend.

Installer bundling remains disabled until the destination supplies its identity, icons, signing, and platform settings. Enable `bundle.active` only after reviewing those values. The resulting native executable still loads the hosted app.

## Native access

The shell registers no native commands or plugins. Its `main` capability has an empty permission list and no remote URL scope. Hosted content has no frontend native access. Add an exact reviewed origin and only the permissions needed for a selected native integration when that integration exists. Follow [Tauri's capability model](https://v2.tauri.app/security/capabilities/); do not add broad remote patterns or a shell plugin by default.

Use the [native shell recipe](../verifications/features/native-shell.md) in the destination. JSON and target validation can be checked without Rust; native compilation, WebView sign-in, packaging, and mobile shells need their own actual platform run.
