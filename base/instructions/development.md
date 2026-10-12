# Development startup and login

This guide owns the starter's setup and development-agent contract. The Convex CLI selects the backend deployment and may authenticate a Convex account. The app has separate Better Auth email/password users. Selecting a backend does not sign a person into the app.

## First setup

1. Install the destination dependencies with its pinned Bun version and matching patches. Rename the package and [Effect service identifier prefixes](../docs/services.md#rename-the-destination) together.
2. Run `bun run codegen:auth`, then `bun run codegen:confect`, before the first Convex startup. Both generators work without an existing deployment and provide the schema/contracts imported by the backend.
3. For cloud development, use `bun run dev:convex` to create/select the destination's `dev:` deployment, then stop that watcher before the aggregate. Keep the CLI-generated `.env.local` in the destination. Configure `SITE_URL` and `BETTER_AUTH_SECRET` on that selected Convex backend. Normal development uses `SITE_URL=http://localhost:3000`.
4. For anonymous development, supply `.env.local` with the required app seed `SITE_URL` and `BETTER_AUTH_SECRET`. An anonymous backend does not need a Convex account or a cloud deploy key. The aggregate supplies its own loopback connection metadata. It never generates an auth secret or silently reuses remote app variables as the seed.
5. Run `bun run dev:cloud` or `bun run dev:anonymous`. Sign up in the app to create an ordinary application user. Keep private values out of public prefixes and captured evidence. Agent login additionally needs the intentional settings below.

## Start a configured development session

Stop existing watchers before an aggregate command. `bun run dev:all` uses the active selected development target and applies the same environment policy as the named commands. It accepts `CONVEX_DEPLOYMENT` beginning with `anonymous:`, `local:`, or `dev:`, or a matching development `CONVEX_DEPLOY_KEY`. Production targets and contradictory deployment/key selections are rejected. A local or anonymous active selection cannot use a cloud key. Normal logged-in cloud startup uses its selected `dev:` deployment without a key. Supplied keys and cloud API/site origins must exactly match the selected deployment, including default HTTPS ports.

`bun run dev:cloud` selects the primary cloud configuration, or the preserved `.env.cloud.local` when recovering from an active anonymous configuration. It reads every selected Convex app variable through `env list --names-only` and `env get`, validates the fetched required variables, then merges those values and trusted connection metadata into `.env.local`. An old local value cannot fill a missing required remote variable. Cloud app updates remain in `.env.local` and `.env.cloud.local` after stop or failure.

`bun run dev:anonymous` requires app seeds in the primary `.env.local`. It filters cloud connection aliases, deployment selectors/keys, provider credentials, and execution controls before uploading app seeds to its own local deployment. It preserves the primary file's exact bytes, activates its own metadata, starts the backend, then seeds app variables per key before Vite starts. A previous anonymous configuration is cached in `.env.anonymous.local`; first startup uses an anonymous selection with API port 3210 and HTTP-site port 3211. The SDK's anonymous agent mode belongs only to the Convex child process. Ctrl+C or failure archives the updated anonymous configuration and restores the original primary file. Existing local application data is retained.

Public app variables begin exactly `NEXT_`, `PUBLIC_`, or `VITE_`. All other app variables remain server-side. The shared required catalog in `scripts/environment/catalog.mjs` starts with `SITE_URL` and `BETTER_AUTH_SECRET`; extend it for destination requirements. Trusted `VITE_CONVEX_URL` and `VITE_CONVEX_SITE_URL` come from the selected backend connection. The reader preserves raw values, removing only the CLI's one appended LF. It performs multiple reads rather than an atomic backend snapshot. Dotenv writes validate a lossless `node:util.parseEnv` round trip before atomic replacement; unrepresentable values fail with a variable name only.

Before generation, the command checks the frontend port and validates both configured local backend origins, `VITE_CONVEX_URL` and `VITE_CONVEX_SITE_URL`, as HTTP loopback origins without paths. It checks both API and HTTP-site ports on IPv4 and IPv6 loopback. An invalid origin or occupied port stops startup. When retaining an existing watcher, start only the missing individual commands instead of launching the aggregate.

The aggregate runs auth generation, then Confect generation, starts Convex, waits for its API `/version` response, seeds a local target, then starts Confect and Vite. `PORT` defaults to 3000. Required `SITE_URL` must be an HTTP loopback origin using that actual frontend port. Selected file values own the app environment; inherited Bun dotenv values cannot override the chosen backend. Child processes disable Bun's automatic dotenv loading. Vite/Confect receive prepared app variables, while only the Convex child receives deployment controls.

Allowed additional arguments are `--local-backend-version <version>`, `--local-cloud-port <port>`, `--local-site-port <port>`, and `--verbose` (or `-v`). Local options require a local or anonymous target. The command checks the effective API and HTTP-site ports, then explicitly passes them to Convex with typechecking enabled. Unknown, duplicate, deployment-selection, environment-file, and arbitrary-command flags fail before generation. For a cached backend, use `bun run dev:all --local-backend-version <cached-version>` with the version actually available in the destination.

Ctrl+C, SIGTERM, or a startup/child-process failure stops only this aggregate's owned child processes. Cancellation also stops pending environment reads/seeds and prevents later activation or child launches. Startup never grants an application admin. Local seeding removes an omitted `ENV` or `CLOUD_AGENT_AUTH_SECRET` from a reused backend, so old development-agent settings cannot silently remain enabled. Supply both intentionally when agent login is wanted.

## Development agent login

`bun run agent:login` requests the guarded sign-in endpoint for `cloud-agent@localhost`. The backend creates or reuses that application user, grants the `admin` role with the exact `system:access` permission, and returns a real Better Auth session. The CLI obtains the normal Convex token and verifies that identity through `whoAmI` before reporting success. The resulting admin panel remains read-only.

Configure these prerequisites intentionally:

| Location | Setting | Requirement |
| --- | --- | --- |
| Backend | `ENV` | Exactly `dev` |
| Backend | `SITE_URL` | HTTP loopback frontend origin, matching the actual port, with no extra path/query |
| Backend | `BETTER_AUTH_SECRET` | Private auth secret for this deployment |
| Backend and private agent process | `CLOUD_AGENT_AUTH_SECRET` | Matching nonempty private secret |
| Private agent process | `PORT` | Actual frontend port; defaults to 3000 |
| Private agent process | `CONVEX_AGENT_MODE` | Unset |

For local or anonymous development, `CONVEX_DEPLOYMENT` must identify the selected `anonymous:` or `local:` deployment. Both `VITE_CONVEX_URL` and `VITE_CONVEX_SITE_URL` must be HTTP loopback origins without paths. Keep a cloud `CONVEX_DEPLOY_KEY` unset for that branch.

For hosted agent login, select the `dev:` deployment in `CONVEX_DEPLOYMENT`. `VITE_CONVEX_URL` must be the exact matching HTTPS `<deployment>.convex.cloud` origin using the default HTTPS port. No deploy key is required for application login. If a development `CONVEX_DEPLOY_KEY` is supplied, it must match the selected deployment. The backend guard still requires the development environment and loopback frontend `SITE_URL`; a cloud deployment does not make the application bypass available in production.

The CLI prints the verified origin, email, role, and paths to private temporary credentials/browser state. It does not print the cookie or token. Use the active browser harness's supported session-import mechanism to apply that state, then exercise the real admin panel. Remove the temporary credentials after use. A failed guard, mismatched deployment/secret, or unavailable app returns an actionable error and a nonzero exit.

Follow the [startup and agent-login recipe](../verifications/features/development-startup.md) for actual destination evidence. Source instructions describe the contract; they do not prove a live command passed.
