# Validated build and deployment commands

These commands are implemented templates. Plain `build` produces the starter's Vite server/client output. A selected hosting module adds its SSR adapter and publishing command. Provider packages, account configuration, a successful provider build, and actual hosted runtime behavior still need verification in the destination. No staging or production operation is needed to import Parts.

## Build

Run from the copied destination root:

```sh
bun run build
bun run build:vercel
bun run build:cloudflare
```

The provider commands require their selected module and pinned dependencies. Each command reads the development deployment selected by `.env.local`; use `--env-file <path>` to select another explicitly configured Convex source. The shared environment owner validates that file's deployment/key selection and derives the exact API and HTTP-site endpoints. A missing file can use a private CI deployment key through the same validated selection path.

Build fetches application variables from the selected Convex deployment, requires `SITE_URL` and `BETTER_AUTH_SECRET`, and computes trusted `VITE_CONVEX_URL` and `VITE_CONVEX_SITE_URL`. It fails on missing required remote values before any code generation or compilation. Old local values do not fill gaps in the fetched configuration.

Auth schema generation runs first, then Confect generation, then read-only Convex code generation, then Vite. Vite disables automatic dotenv loading for builds and receives the validated bundle through a restricted child environment. Variables starting with `NEXT_`, `PUBLIC_`, or `VITE_` are frontend-readable; other application variables stay server-side. Do not put private values under a public prefix. Deployment keys and provider/CLI controls are excluded from the application bundle. The whole shell environment is never serialized.

Before provider compilation, the command resolves the owned generated output paths inside the current destination and clears them. Publishing requires newly emitted SSR artifacts; Cloudflare's generated Worker name must also match its selected target. The Vercel module includes the matching pinned Nitro patch needed to honor build `envDir:false`. Every owned Bun child uses `--no-env-file` so Bun cannot reload local dotenv files independently.

Build does not deploy Convex code, update hosting bindings, or publish a frontend. Its local generated outputs and build artifacts belong to the destination and are not an import set.

## Publish an explicitly selected target

Use a private CI environment containing the selected provider's credentials, with an explicit target and Convex selection file:

```sh
bun run deploy:vercel --target staging --env-file .env.staging
bun run deploy:cloudflare --target production --env-file .env.production
```

There is no default publishing target. `production` requires a selected Convex `prod` deployment. `staging` accepts an explicitly selected `prod`, `dev`, or existing concrete `preview` deployment with its matching scoped private `CONVEX_DEPLOY_KEY`. A staging backend can be the production deployment of a separate Convex project, as described in [Convex's staging guide](https://docs.convex.dev/production/overview#staging-environment). Select that dedicated project's key and endpoints in your own explicit environment file; the hosting label does not select a backend for you. Project-scoped preview tokens and automatic preview creation are not supported by these wrappers. Provider credentials belong to the private invoking process, never Convex application variables, public frontend variables, or anonymous-backend seed data. Do not copy another application's selection file.

Before any backend or hosting write, the command validates the selected deployment/key, fetched required application values, installed provider module/dependencies, private provider credentials, and destination project or Worker configuration. It then generates sources and compiles the target's frontend/server output. A successful compile is followed by explicit `convex deploy --yes` against the selected file, then the provider's runtime binding/deployment operation. Plain build never invokes this backend deployment step.

Vercel upserts only this application's fetched keys and trusted public endpoints into the selected project/team's Preview (`staging`) or Production environment before creating a fresh prebuilt deployment. Private app values use encrypted environment entries; public entries remain public. Other project keys are preserved. Cloudflare uploads the application runtime bundle as encrypted Worker secrets with the code in one `wrangler deploy --secrets-file` operation; values omitted from the bundle remain unchanged. More than 100 bindings fail before backend deployment.

These operations span Convex and the hosting provider and are not a cross-provider transaction. A later failure can leave the selected backend or runtime settings updated; fix the reported prerequisite and rerun against the same explicit target. Do not infer a successful hosted application from a completed build or partial deployment.

Provider credentials are passed through private process environments or authorization headers, never command arguments. Runtime JSON uses an owned OS temporary directory and a mode-0600 file; cleanup removes that known file and directory. On Windows, use a private user/CI temporary directory and account ACLs because POSIX modes do not replace Windows permissions. Commands report safe operation names/statuses and withhold raw provider responses or captured command output that could contain private values.

## Selected modules

Follow the optional module's README in Parts for its exact pinned dependency fragment, static adapter files, destination configuration, and verification prerequisites. Preserve all base dependency patches while merging a module. The registry accepts only the owned `deployment/vercel/vite.config.ts` and `deployment/cloudflare/vite.config.ts` paths; an absent module fails with an import instruction instead of loading another adapter dynamically.
