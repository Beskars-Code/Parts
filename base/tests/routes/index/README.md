# Root page tests

This folder owns accepted automated cases for `/`, corresponding to `src/routes/index.tsx`. Keep its behavior-specific `.test.ts`, `.test.tsx`, or `.e2e.ts` files here. Add further route folders using the same route-owner mapping in [the test guide](../../README.md).

`starter-services.test.ts` covers the three accepted Effect service behaviors. `agent-login.e2e.ts` covers the accepted development-agent browser login. Follow [the E2E job](../../../instructions/e2e.md) before running the latter. Live localization and transition driving is documented separately in [verifications/features/](../../../verifications/features/README.md).
