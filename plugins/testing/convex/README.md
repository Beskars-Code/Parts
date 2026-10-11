# Convex test environment

Optional backend test support for the [base's owner-based test layout](../../../base/tests/README.md). Adopt it when accepted tests actually exercise destination Convex functions or components. The base already supplies Vitest; this module adds `convex-test` 0.0.61 and `@edge-runtime/vm` 5.0.0.

## Import

1. Merge [package.fragment.json](package.fragment.json) into the destination dev dependencies and install with Bun.
2. Replace the base config's single `test` block with two projects:

   ```ts
   test: {
     projects: [
       {
         test: {
           name: "node",
           environment: "node",
           include: ["tests/**/*.test.{ts,tsx}"],
           exclude: ["tests/convex/**"],
         },
       },
       {
         test: {
           name: "convex",
           environment: "edge-runtime",
           include: ["tests/convex/**/*.test.{ts,tsx}"],
           server: { deps: { inline: ["convex-test"] } },
         },
       },
     ],
   }
   ```

   Preserve `defineConfig` and `resolve.tsconfigPaths` from the base. Inline projects inherit root settings in Vitest 5. Keep Node and backend file globs disjoint; no Apollo wallet-specific paths belong in the destination. The explicit `convex-test` inlining carries the source integration's module handling.
3. Place accepted backend cases under `tests/convex/<owner>/`. Use the destination's actual schema, generated API, and Convex module registry when creating `convexTest`. Keep module discovery in a named shared support owner only when multiple cases need it.
4. Run `bun run test --project convex` and verify the expected backend behavior. Report no tests as missing coverage rather than success. A mock backend test does not replace driving required flows against the real app.

This module includes configuration instructions, not product tests or fixtures. See the official [Vitest projects guide](https://vitest.dev/guide/projects) and [Convex testing guide](https://docs.convex.dev/testing/convex-test) for runner and backend contracts.
