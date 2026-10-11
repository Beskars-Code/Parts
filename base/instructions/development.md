# Development startup and login

This guide owns the starter's setup and development-agent contract. The Convex CLI selects the backend deployment and may authenticate a Convex account. The app has separate Better Auth email/password users. Selecting a backend does not sign a person into the app.

## First setup

1. Install the destination dependencies with its pinned Bun version and matching patches. Rename the package and [Effect service identifier prefixes](../docs/services.md#rename-the-destination) together.
2. Run `bun run codegen:auth`, then `bun run codegen:confect`, before the first Convex startup. Both generators work without an existing deployment and provide the schema/contracts imported by the backend.
3. Run `bun run dev:convex` to create or select the destination's development deployment. Keep its generated configuration and references in that destination. Use its public `VITE_CONVEX_URL`; provide `VITE_CONVEX_SITE_URL` explicitly for a local or self-hosted backend. A hosted `.convex.cloud` endpoint supplies the matching `.convex.site` origin to the aggregate startup command.
4. Configure private backend `BETTER_AUTH_SECRET` and backend `SITE_URL` for the actual frontend origin. Normal development uses `http://localhost:3000`. Agent login additionally needs the intentional settings below. Keep private values out of `VITE_` variables and captured evidence.
5. Keep the selected Convex watcher and start only missing watchers with `bun run dev:confect` and `bun run dev`. Sign up in the app to create an ordinary application user.

## Start a configured development session

When the existing watchers are stopped, run `bun run dev:all`. It requires an already selected development target: `CONVEX_DEPLOYMENT` beginning with `anonymous:`, `local:`, or `dev:`, or a development `CONVEX_DEPLOY_KEY`. Production targets are rejected.

The command checks the frontend port and the configured local backend API port on IPv4 and IPv6 loopback before generation. Occupied ports stop startup. When retaining an existing watcher, start only the missing individual commands instead of launching the aggregate.

`dev:all` runs auth generation, then Confect generation, starts the Convex and Confect watchers, waits for the backend API's `/version` response, and starts Vite on the requested strict port. `PORT` defaults to 3000. The frontend process receives the corresponding loopback `SITE_URL` and public Convex site endpoint; configure the backend's `SITE_URL` to that same frontend origin.

Additional arguments go only to the Convex watcher: `bun run dev:all [Convex CLI flags...]`. For a selected local backend with a cached binary, `bun run dev:all --local-backend-version <cached-version>` forwards that version choice to Convex. Use the version actually available in the destination.

Ctrl+C, SIGTERM, or a startup/child-process failure stops the child processes owned by this aggregate run. Configure backend settings separately; startup does not grant an application admin or enable agent login.

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

For hosted development, supply a deployment-scoped `dev:` `CONVEX_DEPLOY_KEY` in the private agent process. `VITE_CONVEX_URL` must be the exact matching HTTPS `<deployment>.convex.cloud` origin. The backend guard still requires the development environment and loopback frontend `SITE_URL`; a cloud deployment does not make the application bypass available in production.

The CLI prints the verified origin, email, role, and paths to private temporary credentials/browser state. It does not print the cookie or token. Use the active browser harness's supported session-import mechanism to apply that state, then exercise the real admin panel. Remove the temporary credentials after use. A failed guard, mismatched deployment/secret, or unavailable app returns an actionable error and a nonzero exit.

Follow the [startup and agent-login recipe](../verifications/features/development-startup.md) for actual destination evidence. Source instructions describe the contract; they do not prove a live command passed.
