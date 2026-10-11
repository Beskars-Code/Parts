# Starter verification guide

This plain Markdown guide describes the connected starter and its destination checks. Its recipes are not proof that a particular deployment passed. Fill in the destination's origin, deployment, selected native options, and evidence before calling that app verified. Keep maintained guides in `verifications/` and local run evidence in the separate `.verifications/` directory.

## Launch

Inspect existing terminals first. Follow the [canonical development guide](../instructions/development.md), preserving auth-then-Confect generation before the first backend startup. Use `bun run dev:all` for a configured deployment with stopped watchers, or start only missing individual processes. Record the actual origin, deployment, readiness signal, and processes owned by this run. A selected native shell adds `desktop:dev` only after its [setup prerequisites](../src-tauri/README.md).

## Doctor

Check that the intended app is answering, its frontend points at the intended Convex deployment, and the caller has the role required by the flow. For the intentionally enabled [agent-login flow](../instructions/development.md#development-agent-login), `bun run agent:login` must confirm the designated application admin. Apply the returned session through the supported harness and verify the protected app continuation. Its credential files are private session state, not proof to publish.

## Drive

Use the attached browser or the project's existing harness. Exercise the user-visible entry and its meaningful continuation with stable selectors. Check permission denial through the real protected backend entry when relevant. The included upgrade is a fake payment; verify its mock label and persisted Pro entitlement. Adopted real Stripe billing additionally needs test-mode checkout, signed webhooks, and entitlement sync.

Maintain the feature index in [features/README.md](features/README.md). Add concrete recipes for the destination's important features instead of guessing selectors or routes here.

Run the [development startup/agent-login](features/development-startup.md) and [todo starter](features/starter.md) recipes against the real destination. Also run [theme/transition](features/theme-and-transitions.md) and [localization](features/localization.md), including reduced motion, persisted theme reload, English SSR, and French switching only when installed. These recipes describe expected behavior; their presence is not live evidence.

## Evidence

Store local screenshots, logs, response bodies, and recorded resulting state in `.verifications/<run>/` at the project root, outside `docs/`. Record the checked revision, role, environment, action, expected result, observed result, and any missing evidence. Keep credentials and bearer tokens out of captured output.

Static validation is `bun run check` plus every populated repository test suite. The base includes three accepted service cases and [test placement guides](../tests/README.md). If no cases remain in the destination, record a no-tests exit as missing coverage, never a pass. Live evidence must show the affected operation and its resulting state; a build or screenshot of an unchanged screen is insufficient.

## Cleanup

Stop only processes this run started. Remove this run's private login files and temporary session state after use. Preserve proof artifacts at the named evidence location. Never kill by process name or remove a shared instance's state.
