# Design

UI and UX do / don't for this product. Add product-specific rules as the UI is built.

## Do

- Reuse existing shadcn components and project tokens.
- Keep the example focused on sign-in, a personal task list, and a clearly labeled local billing demonstration.
- Require real Convex and Better Auth setup before running the example.
- Keep the shader background quiet and theme-aware; pause animation for reduced motion and hidden tabs.
- Theme apps through the semantic colors and radii in `src/styles.css`. Keep both palettes together and use the persisted Light/Dark/System control.
- Animate changing page content with the shared blur transition, keep app chrome still, and use the shared theme reveal with reduced-motion fallbacks.
- Start in English, translate UI copy through route-owned locale catalogs, and offer French only when installed for the project.
- Carry known selections and values into the next step.
- Preserve edits when a write fails and provide a clear recovery action.
- Keep labels and primary actions understandable without implementation knowledge.

## Don't

- Add duplicate actions or a second visual system for an existing flow.
- Hide access checks only in the UI.
- Claim success before the requested operation completes.
