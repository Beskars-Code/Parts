# Design

UI and UX do / don't for the Parts starter.

## Do

- Use a small working todo app as the replaceable example, with clear sign-in and task editing.
- Require real Convex and Better Auth; make billing visibly a local demonstration.
- Keep task data owned by the signed-in user and preserve edits when a write fails.
- Use a quiet shader background derived from the theme tokens, with reduced-motion and WebGL fallbacks.
- Use Tailwind and a small system-font baseline.
- Keep editable shadcn-compatible light/dark tokens in the base stylesheet, with system mode and explicit root overrides.
- Keep Apollo's content blur and global theme reveal, with reduced-motion fallbacks and persistent app chrome outside page motion.
- Start in English using typed, route-owned locale catalogs; add French only when the project requests it.
- Add product-specific UI rules in the destination's `docs/design.md`.

## Don't

- Ship Apollo branding, plans, dashboards, or user data in the starter.
- Present mocked billing as a real payment or require Stripe credentials for the demonstration.
