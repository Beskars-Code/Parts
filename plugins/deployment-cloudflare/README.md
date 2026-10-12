# Optional Cloudflare Workers SSR deployment

This module provides an implemented static TanStack Start SSR adapter, pinned package fragment, Worker configuration, and runtime binding delivery through the base deployment scripts. It targets Workers with server rendering, not a Pages static export. A destination provider build and hosted runtime verification remain prerequisites; Parts does not deploy or verify staging/production while importing it.

## Import

1. Copy `deployment/cloudflare/` into the destination's `deployment/cloudflare/`.
2. Merge `package.fragment.json` into the destination manifest. Keep `@cloudflare/vite-plugin` at `1.63.1` and `wrangler` at `4.149.0`.
3. Merge the exact `entry` and `project` arrays from `knip.fragment.json`. Keep the base entries.
4. Retain the base `patchedDependencies` and their matching `patches/`. These provider packages require no additional Parts patch.
5. Install the merged destination dependencies through normal project setup and retain the destination's own lockfile. Do not copy another application's Worker config, credentials, generated `.wrangler/`, or environment files.
6. Replace all `configure-parts-worker*` names in `deployment/cloudflare/wrangler.json` with destination-owned names. Each named environment selects its own Worker. Publishing refuses an unchanged placeholder.

The static Vite config composes the base factory and registers the Cloudflare plugin before TanStack Start with the `ssr` Vite environment. Wrangler's main entry is `@tanstack/react-start/server-entry`. The `nodejs_compat` flag and compatibility date after `2025-04-01` make Worker text/secret bindings available through `process.env` for the starter's existing server auth adapter. Remote bindings are disabled in this build configuration.

These optional packages are absent from the current Parts verification host; an actual Cloudflare provider build has not been run here.

## Configuration and commands

The [shared deployment guide](../../base/scripts/deployment/README.md) owns app variables, build order, explicit Convex target/key selection, private-value handling, and command behavior.

```sh
bun run build:cloudflare
bun run deploy:cloudflare --target staging --env-file .env.staging
bun run deploy:cloudflare --target production --env-file .env.production
```

Build selects `development` and performs no provider write. Publishing requires private CI `CLOUDFLARE_API_TOKEN` with Worker deployment permissions and the explicit destination `CLOUDFLARE_ACCOUNT_ID`. Provider credentials never enter the application bundle, Convex app variables, or anonymous-backend seed data. The selected Convex deployment file/key must agree with the target.

The deploy command passes its explicit target through `CLOUDFLARE_ENV` during Vite compilation. The plugin emits a flattened Worker configuration and a `.wrangler/deploy/config.json` pointer to it. Before upload, the wrapper resolves the pointer inside the current destination's generated `dist/` and requires the generated Worker name to equal that target's configured name. It deploys that generated config directly. Do not add `wrangler deploy --env`: the Vite plugin already flattened the environment during build, so a later `--env` is not applicable.

The complete validated application runtime bundle is written to an owned mode-0600 OS temporary JSON file and delivered with `wrangler deploy --secrets-file`. This updates code and secrets together, preserves exact string bytes, and leaves omitted bindings intact. The command refuses more than 100 runtime bindings before backend deployment. Values never appear in command arguments, provider diagnostics, or committed configuration. On Windows, the invoking account's private temporary-directory ACLs provide access control.

## Destination verification

After installing the selected pins, run a development-only provider build and inspect generated SSR code/client assets. Check that a missing required Convex app variable fails before compilation and that an unchanged Worker placeholder cannot publish. When the destination owner authorizes publishing, prove SSR, auth, protected app behavior, and actual server runtime bindings through the hosted Worker. Keep its maintained recipe under `verifications/` and local results under `.verifications/`. Metadata/static checks do not prove Workers runtime compatibility.

## Primary sources

- [Cloudflare's TanStack Start SSR guide](https://developers.cloudflare.com/workers/framework-guides/web-apps/tanstack-start/)
- [Vite plugin input/output configuration and environment selection](https://developers.cloudflare.com/workers/vite-plugin/reference/migrating-from-wrangler-dev/)
- [Vite plugin API](https://developers.cloudflare.com/workers/vite-plugin/reference/api/)
- [Upload runtime secrets alongside code](https://developers.cloudflare.com/workers/configuration/secrets/)
- [Worker process.env binding support](https://developers.cloudflare.com/changelog/post/2025-03-11-process-env-support/)
