# Optional Vercel SSR deployment

This module provides an implemented static TanStack Start SSR adapter, pinned package fragment, and Vercel publishing integration through the base deployment scripts. It uses Nitro's `vercel` preset and Node 24 functions. It is not a static-export template. A destination provider build and live hosted runtime verification remain prerequisites; Parts does not deploy or verify staging/production while importing it.

## Import

1. Copy `deployment/vercel/` into the destination's `deployment/vercel/`.
2. Merge `package.fragment.json` into the destination manifest. Keep `nitro` at `3.0.260903-beta` and `vercel` at `59.11.7`.
3. Merge the exact `entry` and `project` arrays from `knip.fragment.json`. Do not replace existing application or tooling entries.
4. Copy this module's `patches/` and merge its `patchedDependencies` entry. Keep the matching `nitro@3.0.260903-beta` patch together with that pin, and retain every base patch entry/file.
5. Install the merged destination dependencies through the project's normal setup, retain its own lockfile, and select/configure its own Convex source. Never copy another application's lockfile, `.vercel/`, or environment files.

The static Vite config calls the base `createBaseViteConfig` factory and places Nitro between TanStack Start and React. This preserves the base public-prefix policy, build dotenv isolation, server-only locale guard, styles, and auth bundling configuration. The Nitro preset emits Vercel Build Output API artifacts under `.vercel/output`; Vercel deploy consumes that fresh output with `--prebuilt`.

The pinned Nitro Vite plugin otherwise loads dotenv files even when Vite's `envDir` is `false`. Its matching one-line patch passes `dotenv:false` to Nitro's initializer in that case. This prevents old local public variables or provider controls from entering a Convex-authoritative build. Dev/default dotenv behavior is preserved. A static `nitro({dotenv:false})` is not a supported plugin option for that separate initializer; do not omit the patch or substitute the internal preinitialized-instance hook.

Use Node 24 for the Vercel runtime and destination setup, as required by the official TanStack Start Vercel guide. The current Parts verification host has Node 22 and no installed Nitro/Vercel package, so this optional provider build has not been run here.

## Configuration and commands

The [shared deployment guide](../../base/scripts/deployment/README.md) owns fetched app variables, build order, explicit Convex target/key selection, private-value handling, and command behavior.

```sh
bun run build:vercel
bun run deploy:vercel --target staging --env-file .env.staging
bun run deploy:vercel --target production --env-file .env.production
```

Build performs no provider write and needs no Vercel token. To publish, privately configure `VERCEL_TOKEN`, `VERCEL_PROJECT_ID` for the destination project, and `VERCEL_ORG_ID` for its owning team in the invoking CI process. Project/team IDs are explicit; the wrapper does not infer an existing linked project. The token needs that project's environment-update and deployment permissions. The selected Convex file/key must agree with the target.

`staging` maps to the selected project's Preview environment; `production` maps to Production. It updates only fetched application keys with an environment-scoped upsert API request, then creates a fresh prebuilt deployment. A private token reaches the API through the authorization header and the pinned CLI through `VERCEL_TOKEN` in its private child environment. It is never passed as `--token`, embedded in frontend output, or written to `auth.json`.

The included `vercel.json` is the static provider configuration. For a dashboard/Git build, select its equivalent `bun run build:vercel` build command and configure the selected private Convex deployment key in the build process. Application configuration comes from Convex. A dashboard/Git build alone does not run this wrapper's runtime upsert step; use the explicit deploy command when synchronizing Convex-owned runtime variables.

## Destination verification

After importing and installing the selected pins, run a development-only provider build and inspect that `.vercel/output` contains an SSR function and client assets. Prove required missing Convex application values fail before compilation. When the destination owner explicitly authorizes publishing, verify server rendering, email/password auth, protected reads/writes, and runtime variable availability through that deployed application. Maintain its plain Markdown recipe under `verifications/` and put local run evidence under `.verifications/`. A source/config check is not proof of a live Vercel integration.

## Primary sources

- [Vercel's TanStack Start SSR guide](https://vercel.com/kb/guide/deploy-a-tanstack-start-app-to-vercel)
- [Nitro Vercel preset](https://nitro.build/deploy/providers/vercel)
- [Environment-scoped upsert API](https://vercel.com/docs/rest-api/projects/create-one-or-more-environment-variables)
- [Vercel prebuilt deployments](https://vercel.com/docs/cli/deploy)
- [CLI token environment authentication source](https://github.com/vercel/vercel/blob/main/packages/cli/src/index.ts), confirmed in the published `vercel@59.11.7` `dist/index.js`
