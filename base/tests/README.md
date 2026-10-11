# Test ownership

Keep tests with the route or reusable owner they protect. The base includes runner configuration, placement guides, and three accepted starter service cases. They execute real domain logic with Effect-injected session, task/account storage, and billing dependencies. They do not prove browser login or deployed Convex behavior. Add or extend a test only after the user accepts that specific behavior.

| Owner | Test folder |
| --- | --- |
| `/` | [routes/index/](routes/index/README.md) |
| `/settings/profile` | `routes/settings/profile/` |
| Route group and dynamic parameter | Preserve its group and `$parameter` names in nested route folders |
| `convex/<concern>/` | [convex/](convex/README.md), then the same concern path |
| `src/components/<concern>/` | [components/](components/README.md), then the same concern path |
| Shared test setup | [support/](support/README.md), grouped by its concrete concern |

The table's paths are relative to `tests/`. Create new owner folders when there is an accepted case to put there. Route groups describe source ownership even when they do not appear in the URL. Keep `$projectId` as a folder name rather than substituting a fixture ID. Normalize flat route filenames into the same nested owner path: `settings.profile.tsx` belongs to `tests/routes/settings/profile/`. Shared route-layout behavior belongs to its layout owner, such as `tests/routes/__root/`.

Name case files after behavior, ending in `.test.ts` or `.test.tsx`. Unit and integration cases for one owner stay together; do not create parallel top-level `unit/`, `integration/`, or `e2e/` trees. Non-route domain services and tools follow the same owner-mirroring rule under `tests/services/` or `tests/tooling/` when needed.

## Runner

[vitest.config.ts](../vitest.config.ts) runs `tests/**/*.test.{ts,tsx}` in Node with the app's TypeScript path aliases. `bun run test` runs accepted cases once. If the destination removes the starter cases and has no other cases, the command exits unsuccessfully; this is not a green test suite. Do not add empty assertions or enable `passWithNoTests` to hide that result.

An explicit `bun run test --passWithNoTests` may check runner discovery while the scaffold is empty. Report it as a configuration smoke check with zero behavior coverage; keep the default command's no-tests failure.

The optional Parts `plugins/testing/convex/` module supplies the dependency fragment and edge-runtime project configuration for real backend tests. Browser driving stays in [verifications/](../verifications/README.md) until the destination selects a browser harness. No browser runner is installed by this test foundation.
