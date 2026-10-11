# Backend tests

Mirror the real backend owner: `convex/billing/` maps to `tests/convex/billing/`. A native component registered under `components/<name>/` keeps that owner under `tests/convex/components/<name>/`. Keep accepted cases beside the concern they protect rather than grouping all mutations or all queries together.

Use the optional Parts `plugins/testing/convex/` dependency fragment and edge-runtime project configuration when backend cases need `convex-test`. Supply the destination's real schema, generated function references, and module registrations. Never copy Apollo product fixtures or generated backend files.

There are no backend cases or fixture helpers in this starter. Live checks and their evidence remain in [verifications/](../../verifications/README.md) and `.verifications/`.
