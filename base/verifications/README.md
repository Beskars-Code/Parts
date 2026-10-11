# Project verification template

This is a plain Markdown import template, not a proven live runbook. Fill in actual commands, routes, selectors, data prerequisites, and cleanup from the destination app's code, then execute one complete recipe before calling the runbook ready. Keep this maintained guide in `verifications/README.md` and feature recipes in `verifications/features/`.

## Launch

Inspect existing terminals first. Start only missing processes through the destination's scripts, typically `bun run dev` and `bun run dev:convex`. Record the actual origin, deployment, readiness signal, and processes owned by this run. A native app adds its own launch command only when Tauri is selected.

## Doctor

Check that the intended app is answering, its frontend points at the intended Convex deployment, and the caller has the role required by the flow. If agent login is installed, `bun run agent:login` must confirm the designated development admin. Its credential files are private session state, not proof to publish.

## Drive

Use the attached browser or the project's existing harness. Exercise the user-visible entry and its meaningful continuation with stable selectors. Check permission denial through the real protected backend entry when relevant. Billing verification uses Stripe test mode and the project's actual catalog and subscription behavior.

Maintain the feature index in [features/README.md](features/README.md). Add concrete recipes for the destination's important features instead of guessing selectors or routes here.

The base supplies [theme/transition](features/theme-and-transitions.md) and [localization](features/localization.md) recipes. Run them against the copied app, including reduced motion, persisted theme reload, English SSR, and French switching only when installed. These recipes describe expected behavior; their presence is not live evidence.

## Evidence

Store local screenshots, logs, response bodies, and recorded resulting state in `.verifications/<run>/` at the project root, outside `docs/`. Record the checked revision, role, environment, action, expected result, observed result, and any missing evidence. Keep credentials and bearer tokens out of captured output.

Static validation is `bun run check` plus every populated repository test suite. The base supplies Vitest configuration and [test placement guides](../tests/README.md) without cases; record its initial no-tests exit as missing coverage, never a pass. Live evidence must show the affected operation and its resulting state; a build or screenshot of an unchanged screen is insufficient.

## Cleanup

Stop only processes this run started. Remove this run's private login files and temporary session state after use. Preserve proof artifacts at the named evidence location. Never kill by process name or remove a shared instance's state.
