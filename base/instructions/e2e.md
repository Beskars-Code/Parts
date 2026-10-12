# TesterArmy E2E

The base includes [TesterArmy e2e](https://github.com/tester-army/e2e) with its web engine and one deterministic agent-login case. It uses exact locators and assertions, with no model, subscription, AI credential, or natural-language agent step configured.

## Run

1. Install destination dependencies with the pinned Bun version. The manifest pins `e2e` to `0.19.0` and `@e2e-dev/web` to `0.14.0`.
2. Have Node 24.8 or newer on `PATH`, or Node 22.22.3 or newer within the Node 22 release line. The framework runs on Node; Bun manages dependencies and invokes the command. TesterArmy's [quickstart](https://e2e.tester.army/docs/quickstart) directs Windows users to WSL. Install dependencies and start the app in the same environment as the runner so loopback URLs and private session paths agree.
3. Follow [development agent login](development.md#development-agent-login) to intentionally enable the designated account on an isolated development backend. Keep the secret private. The E2E setup reuses those settings, the selected deployment, and `PORT`; it adds no alternate app origin or credential setting.
4. Start the destination with `bun run dev:cloud`, `bun run dev:anonymous`, or `bun run dev:all`. Inspect existing watchers first and start only missing processes. The E2E command attaches to that app and does not launch another frontend or backend.
5. Run `bun run test:e2e` from the destination root. The web engine downloads its pinned Chromium browser on the first run if missing. Linux hosts may need the engine's documented browser system dependencies.

The root-route case calls the existing guarded `agent:login` implementation through Node, imports its real cookies, opens `/`, and checks `cloud-agent@localhost` and the Sign out control. The CLI already verifies the account's admin role and exact `system:access` permission against Convex. No todo or billing writes are performed.

## Files and extension

- `e2e.config.ts` selects one Chromium target and `tests/**/*.e2e.ts`. No model is configured.
- `scripts/testing/e2e.mjs` launches the Node CLI directly, skipping Bun's Node aliases on `PATH` while preserving the base's Bun runtime setting for other commands.
- `tests/routes/index/agent-login.e2e.ts` owns the accepted root-route login case.
- `tests/support/auth/agent-login.ts` owns `authenticateAgent(browser)`. It calls the existing login command, validates its private session files, imports cookies, and removes those files even when importing fails.

Add accepted browser cases under their route or source owner, ending in `.e2e.ts`. Reuse `authenticateAgent(browser)` when a case needs this development account. Keep ordinary `.test.ts` and `.test.tsx` cases with the same owners; Vitest and TesterArmy discover their own file suffixes. Do not add cases without the user's acceptance. Run `bun run test` separately for the existing service cases.

## Results and recovery

The runner writes reports to ignored `.verifications/e2e/`. Trace, video, and action caching are off. Reports may still contain screenshots and visible app data, so treat them as private local evidence. Do not publish raw session files, cookies, tokens, secrets, or unreviewed reports. The framework's private runtime directory `.e2e/` is ignored too.

A usable browser session is required for the case to pass. Unavailable servers, a rejected agent guard, or a broken browser session fail the run rather than falling back to a mock or passing an empty suite. Check the current development terminals and the canonical login prerequisites before retrying. Keep this account and its data in development deployments; the config and login command retain the existing deployment guards.

The runner closes its browser when finished. The app watchers remain owned by the command that started them. Record the tested revision, actual target, command result, and report location following [the verification guide](../verifications/README.md). A copied setup alone is not proof that a destination passed.
