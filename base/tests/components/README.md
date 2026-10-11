# Shared component tests

Mirror reusable UI owners from `src/components/`: theme behavior belongs to `tests/components/theme/`, for example. Route-specific UI stays with its route owner under `tests/routes/`.

The base runner uses Node. Add a browser or DOM environment only when an accepted component test needs it; no such runner or product case is included here. Share setup through named concerns in [support/](../support/README.md), rather than duplicating fixtures or adding production exports used only by tests.
