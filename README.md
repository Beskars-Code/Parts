# Parts

My reusable foundation for future projects: the tech stack, file structure, commands, and optional modules I want my agents to start from.

Parts is a source of conventions and building blocks. In a new repository, I should be able to tell an agent which parts to bring over, and have it adapt and connect them to that project. Parts itself does not need to be a runnable application.

**Current contents:** a [base project template](base/README.md), [auth and agent login module](plugins/auth/README.md), [Stripe module](plugins/stripe/README.md), and optional [French locale](plugins/locales/fr/README.md), extracted and adapted from Apollo-Predictions and Apollo Labs. These are source and integration templates; they become a running app after an agent connects them in a destination project.

## Start here

| Part | What to bring over |
| --- | --- |
| [base/](base/README.md) | Base `package.json`, TanStack/Vite config, strict linting, Knip, TypeScript, patches, architecture docs, and project instructions |
| [plugins/auth/](plugins/auth/README.md) | Better Auth/Confect integration, roles and permissions, and development admin login |
| [plugins/stripe/](plugins/stripe/README.md) | Code-owned Stripe catalog scripts, backend mirrors, and billing adaptation references |
| [plugins/locales/fr/](plugins/locales/fr/README.md) | Opt-in French catalog and language switcher; the base starts in English |
| [Test layout](base/tests/README.md) | Route and source-owner folders, with Vitest configured and no product cases |
| [Convex test environment](plugins/testing/convex/README.md) | Optional backend test dependencies and edge-runtime configuration |
| [Verification template](base/verifications/README.md) | Plain Markdown runbook, feature recipes, and evidence conventions outside `docs/` |
| [Importing guide](docs/importing.md) | How agents select, merge, configure, and verify parts |
| [Start-project agent guide](instructions/start-project.md) | Create the base repo, start it, and add selected modules |
| [Source provenance](docs/sources.md) | Apollo revision, adaptations, and current limitations |

The baseline keeps Apollo's harsh quality policy: Oxlint plus full ESLint, zero warnings, no inline suppression, strict TypeScript and Effect diagnostics, Knip for dead code, and cyclomatic complexity capped at **6**. Next.js dependencies and route exceptions are replaced with the preferred TanStack Start setup.

Structure lint also warns and fails when a handwritten code file exceeds **1,000 physical lines** or a folder contains more than **8 direct handwritten code files**. Generated code is excluded. Agents split files by responsibility and organize folders by concern.

`base/` is the copyable starting repo: it includes a minimal TanStack app and empty Convex configuration. Parts as a whole remains a catalog of reusable pieces. Agents follow [instructions/start-project.md](instructions/start-project.md) to create a destination project and connect opt-in modules.

Vite forwards browser console logs and unhandled errors into the dev terminal by default in this base, so agents can inspect frontend and server output together.

The base includes editable shadcn-compatible light/dark palettes, a persisted Light/Dark/System picker, and Apollo's page blur and theme polygon transitions. English translation infrastructure is included from the start; French is an opt-in module. Route-owned catalogs live in nested `locales/` folders and are delivered through server loaders, keeping unrelated catalogs out of client imports. Apps change their shared palette and catalogs instead of recreating these foundations.

## Tech stack

| Technology | Role |
| --- | --- |
| Bun | Runtime and package manager |
| Oxlint | Linting |
| TanStack Start | App framework and file-based routing |
| React | UI components |
| use-intl | Typed messages and formatting, with English as the base locale |
| Convex | Backend, with WorkOS, Confect, and other components |
| Effect | Typed effects and workflows |
| OpenRouter | Model API gateway |
| TypeScript | Static typing |
| Vitest | Automated tests organized by route and source owner |
| shadcn | UI component toolkit |
| Shaders | Visual effects |
| Tauri 2 | Optional desktop and mobile apps with native integrations |

WorkOS is the default authentication choice, with Better Auth available as an alternative. A project selects the provider it needs. Roles, permissions, and application behavior should stay behind the project's shared auth interfaces so changing providers does not require rewriting each feature.

Tauri is included when a project needs native apps. Other capabilities, such as AI, billing, and visual effects, are brought in when the project needs them.

## What belongs here

- **Base structure:** the preferred folder layout and boundaries for app features, shared services, Convex code, and project configuration.
- **Tooling and commands:** reusable Bun scripts and agent commands for development, checks, builds, and module-specific setup.
- **Reusable modules:** code and integration instructions for capabilities that recur across projects.
- **Agent guidance:** how to select, import, configure, and verify those parts in a destination repository.

The baseline should stay small. Each optional capability should have a clear entry point, own its dependencies and behavior, and explain how it connects to the baseline.

## Reusable modules

Here, a "plugin" means an optional capability an agent can bring into a project. It can be a custom Convex component, a service, configuration, or a group of files with setup instructions. A plugin does not require a shared runtime plugin system.

| Module | Intended contents |
| --- | --- |
| Authentication | Better Auth source template available; WorkOS adapter remains to be added |
| Roles and permissions | Confect authority middleware and strict permission predicate available; apply them to the destination's query, mutation, and action entry points |
| Agent login | Better Auth development admin endpoint and login CLI available; destination auth routes and identity query must be connected |
| Convex components | Custom reusable backend components and their integration points |
| Stripe billing | Catalog tooling and mirrors available; checkout, subscription sync, and webhook source provided as adaptation references |
| AI | Planned OpenRouter integration and reusable Effect workflows |
| Native apps | Planned optional Tauri setup and native integrations |
| French locale | Optional catalog, registry change, and language switcher; English remains the default |
| Convex testing | Optional `convex-test` and edge-runtime setup for accepted backend cases |

Each module should document:

- What it provides and which files to import.
- Its dependencies, configuration, and setup commands.
- Its public entry points and how the destination project uses them.
- Any provider choices or project-specific values to adapt.
- How to verify the imported behavior in the destination project.

### Roles, permissions, and agent access

Protected backend functions should use the shared custom Convex query, mutation, and action builders. Those entry points resolve the caller's identity and enforce the required role, permission, and ownership rules on the server. UI visibility reflects those rules; it does not enforce access by itself.

The agent login module should provide a development and test authentication bypass that resolves to a designated admin identity. Once signed in, the agent uses the same permission checks and application flows as that admin. The bypass must be explicitly enabled for a development or test environment and unavailable in production.

## Using Parts in a new project

1. Start with the destination project's requirements and existing files.
2. Select the baseline conventions and the modules the project needs.
3. Bring over the selected files, their dependencies, and setup instructions.
4. Adapt project-specific configuration and connect the modules through their public entry points.
5. Verify the resulting behavior in the destination project and report what was imported, configured, or still missing.

Importing a module includes connecting it to the app. For example, bringing over roles and permissions also means applying the shared builders to protected backend functions. Bringing over agent login means the agent can sign in and exercise the requested admin flows.

### Example agent requests

```text
Use https://github.com/Beskars-Code/Parts as the foundation for this new repo.
Bring over the base structure, tech stack, tooling, and commands.
Use WorkOS for authentication. Include only the modules this project needs.
```

```text
Bring over the agent login module from Parts so you can connect to this
project's development environment as an admin and verify the admin flows.
```

```text
Import the role and permission handling from Parts. Connect protected
backend functions through our custom Convex queries, mutations, and actions.
```

```text
Bring over the Stripe billing module from Parts and connect it to this
project's plans and subscription flow.
```

Agents should inspect both repositories before importing, reuse compatible code already in the destination, and bring along the selected module's required dependencies. They should distinguish available modules from planned ones and report any missing pieces explicitly.

## Keeping Parts useful

When a project produces a reusable improvement, bring the general version back here with its integration instructions. Keep product-specific features, data, credentials, and business rules in the project that owns them.

The goal is to make the next project start with the same foundation, then add only what that project needs.
