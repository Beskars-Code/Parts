# Auth, permissions, and agent login

This module extracts Apollo's Better Auth and Confect integration. WorkOS remains the default project choice described by Parts; use this implementation when selecting Better Auth, or adapt its application identity boundary to WorkOS. A WorkOS session adapter is not implemented here.

## Import set

Copy the module's `confect/`, `components/`, `scripts/`, and `patches/` into the destination, merging existing owners. Merge `package.fragment.json` into the destination manifest. Do not copy that fragment as a replacement manifest.

- `confect/services/auth/cloudagent/` owns the development endpoint, access policy, admin session, and Better Auth SDK boundary.
- `confect/services/auth/component.ts` configures the Better Auth component, the Convex auth plugin, admin roles, server-owned permissions, and agent endpoint. Apollo's user-profile provisioning hooks have been removed.
- `confect/services/auth/betterauth.ts` exposes `getUser`, `requireUser`, and `requireAdmin`; it is the provider boundary consumed by middleware.
- `confect/middleware/` provides `RequireUser`, `RequireAdmin`, and `RequirePermission` for queries, mutations, and actions.
- `scripts/development/agent-login.mjs` obtains a real session and Convex token and writes private credential and browser-state files to a temporary directory.

The source-backed templates require the destination's generated Confect schema, services, component references, and Convex API. Those generated files are intentionally absent from Parts.

## Connect the destination

1. Register the Better Auth component in the destination Convex component configuration. Generate `components/betterAuth/generatedSchema.ts` from the destination auth options, then regenerate Confect/Convex code.
2. Connect `confect/auth.ts` to the destination auth configuration. Register the component's auth routes in the Convex HTTP router.
3. Implement the TanStack Start auth route/proxy using the selected provider's integration. The browser-facing app must expose `/api/auth/cloud-agent-sign-in` and `/api/auth/convex/token`. Apollo's Next.js route is not copied.
4. Configure the desired real login providers in `component.ts`. The extracted options retain Apollo's Google provider settings; supply its configuration or replace that provider for the project.
5. Expose an authenticated `api.auth.whoAmI` query returning the caller's email and role. The login CLI uses that query to prove its token authenticates the designated admin.
6. Compose `RequireUser` before `RequirePermission`. Apply `RequireAdmin` to admin operations, with each function's explicit contracts, and enforce tenant/row ownership in its owning service.
7. Add the actual registered Confect spec/implementation and component entries to Knip, preserving ordinary service dead-code detection. Generate references after registration.

## Permission contract

Permissions are stored as a JSON string map. `hasPermission(user, permission)` grants access only when the named key is exactly `true`; missing users, absent keys, null values, and malformed JSON deny access.

An admin role does not implicitly grant every permission. `RequireAdmin` checks `role === "admin"`; `RequirePermission` checks its specific key. Decide and grant the destination admin's needed permissions on the server. Better Auth marks `permissions` with `input: false` to prevent clients granting themselves access.

Apollo had no application callers of `RequirePermission` at the pinned revision. It is a reusable middleware implementation, not evidence that every Apollo function already enforced granular permissions.

## Agent login contract

The bypass changes the development sign-in path. It does not bypass backend permissions after sign-in.

The backend requires `ENV=dev`, an HTTP loopback `SITE_URL` with no extra path/query, and a matching bearer `CLOUD_AGENT_AUTH_SECRET`. It creates or reuses `cloud-agent@localhost` as an admin and issues a real Better Auth session cookie. The CLI requests the normal Convex token endpoint and confirms that identity with `whoAmI`.

The CLI requires a deployment-scoped `dev:` `CONVEX_DEPLOY_KEY`, rejects `CONVEX_AGENT_MODE`, and checks `VITE_CONVEX_URL` matches that development deployment. `PORT` selects the loopback frontend port, defaulting to 3000. `VITE_CONVEX_SITE_URL` is derived for hosted Convex or supplied for other backends.

Backend configuration: `ENV`, `SITE_URL`, `CLOUD_AGENT_AUTH_SECRET`, `BETTER_AUTH_SECRET`, and any selected login provider configuration. Agent process/private `.env.local`: `CONVEX_DEPLOY_KEY`, `CLOUD_AGENT_AUTH_SECRET`, `VITE_CONVEX_URL`, and optional `PORT`. The frontend and backend origins and shared development secret must agree.

Run `bun run agent:login` in the integrated destination. It prints the verified email, role, origin, and paths to private credential files, not cookies or tokens. Use the supported browser/session import capability of the active harness to establish that session; the browser-state output alone does not attach a browser. Remove the private files after use.

## Verify

In the destination, prove successful admin sign-in and a real admin operation. Confirm missing/wrong secrets and non-development deployments are denied. Exercise a protected operation as an unauthorized caller and confirm no protected effect. Test explicit permission grants and malformed permission maps when that middleware is adopted. Maintain these recipes as Markdown in `verifications/` and record local results in the separate `.verifications/` directory, outside `docs/`.
