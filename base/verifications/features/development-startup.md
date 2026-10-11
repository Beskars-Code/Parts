# Development startup and agent login

Run against an isolated destination development deployment. Follow the [canonical development guide](../../instructions/development.md) for the selected target, frontend origin, backend settings, and intentionally guarded agent prerequisites. Convex CLI identity and the application user are separate. This recipe requires real command and backend results, not only source inspection.

## Drive

1. Before the first backend startup, install and run auth generation followed by Confect generation. Select the destination development deployment with the Convex CLI and configure its frontend/backend settings. Record the selected deployment kind and actual public endpoints without credentials.
2. Stop existing development watchers, then run `bun run dev:all`. Confirm generation finishes before backend bundling, Convex and Confect remain running, the API becomes ready before Vite starts, and the frontend uses the requested strict `PORT`. For a local cached backend, record the actual version argument forwarded to Convex.
3. Open the app and finish an ordinary sign-up, task creation, and reload. Confirm the app user and persisted task belong to that Better Auth session. Startup alone must not grant that ordinary user an admin role.
4. In a separate verification attempt, keep the frontend port or configured local API port occupied. Confirm `dev:all` exits before generation/startup and leaves that existing process alone. With existing watchers retained, start only missing individual commands instead. Confirm a missing development selection or production target is rejected.
5. With agent prerequisites intentionally configured, run `bun run agent:login`. Confirm success reports `cloud-agent@localhost`, role `admin`, the frontend origin, and private temporary file paths. Inspect the verified `whoAmI` result or protected overview to confirm `system:access` is exactly `true`. Import the returned session through the supported harness mechanism and open the read-only admin panel.
6. Run `agent:login` again and confirm it reuses the designated application user while issuing a valid session. Confirm missing/wrong secrets, an unavailable app, or a disabled backend development guard fail without printing credentials. In local/anonymous verification, confirm non-loopback API/site endpoints and a supplied cloud key are denied; in hosted verification, confirm a mismatched development key/URL is denied. `CONVEX_AGENT_MODE` must be rejected in both branches.
7. Stop the aggregate with Ctrl+C and confirm its recorded child processes stop, including the frontend and local backend it started. Keep any unrelated process used by the verification running. Repeat a failed-startup cleanup where supported, and confirm a new configured run can start after its owned ports are released.

## Evidence and cleanup

Record revision, deployment kind, actual origins/ports, forwarded local version, command exit codes, generation/readiness order, user/admin identity, resulting task state, and owned-process cleanup under `.verifications/<run>/`. Redact secrets, deployment credentials, cookies, tokens, and the contents of temporary login files.

A generated browser-state file is not proof that a browser used the session. Record the authenticated app continuation and protected overview result. Restore verification-only backend settings and remove the temporary credentials after use. Stop only processes owned by the run. Missing access or an unperformed command is an explicit verification gap.
