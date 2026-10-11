# Optional native shell

Run only when the destination adopts [src-tauri/](../../src-tauri/README.md). The source template is a hosted-server shell. It needs Rust, platform native prerequisites, the selected CLI dependency, destination identity/icons, and a running or deployed TanStack Start app. A JSON parse does not prove a native build.

## Drive

1. Start the existing web and Convex watchers. Run `bun run desktop:dev` without starting a second frontend. Confirm the native WebView opens `http://localhost:3000`, then sign up/sign in and create, edit, complete, and delete a task through the real backend.
2. Reload or restart the shell and confirm real session behavior and persisted tasks. Check normal keyboard use, theme selection, reduced motion, and resizing down to the configured minimum dimensions.
3. Confirm missing `SITE_URL`, HTTP release targets, and the tracked placeholder target are rejected by `desktop:build` before launching the native compiler. Set `SITE_URL` to the reviewed deployed HTTPS app and build. Confirm the Rust release check sees the matching configured target.
4. Launch the release executable and confirm it opens that exact hosted origin. Exercise sign-in, task persistence, mock upgrade, and the permission-protected admin panel. The host still needs a TanStack server and Convex; no offline functionality is claimed.
5. Inspect native capabilities and registered plugins/commands. The starter has no frontend native permissions and no remote native scope. A selected native integration must use an exact reviewed origin and its minimum required permissions, with an actual platform check.
6. If installer bundling or a mobile shell is selected, separately verify identity, icons, signing, packaging, and the corresponding operating system. Do not treat a web run as a native platform result.

## Evidence and cleanup

Record operating system, Rust/CLI versions, hosted target, build result, session/task continuation, and any native permissions under `.verifications/<run>/`. Keep secrets out of logs. When tools, icons, or signing are absent, report native compilation or packaging as unverified. Restore local settings and stop only processes owned by the run.
