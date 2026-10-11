# Todo starter

Run against the destination's real Convex deployment and Better Auth integration using the [canonical development setup](../../instructions/development.md). Preserve auth-then-Confect generation before the first backend startup; use aggregate startup only with stopped watchers. The user app and expandable read-only admin panel share `/`. The [startup and agent-login recipe](development-startup.md) verifies the separate deployment-selection and guarded application-admin flows.

## Drive

1. Open `/` signed out. Sign up with a unique test email and name. Confirm the app opens the task workspace with that account, then reload and confirm the real session remains. Sign out and sign back in with the same email/password. Use a second account for isolation checks; do not reuse credentials from another product.
2. Create a task, rename it, mark it complete, and reload. Confirm the exact title and completion state persist. Delete it and confirm it remains absent after reload. Submit a blank or over-200-character title through the backend boundary and confirm rejection without a stored row.
3. As a free account, create five tasks. Complete one; the count should still be five and another create must remain denied. Delete one; creation should become available again. Exercise the public mutation directly as well as the form so the cap is proven on the server.
4. Open the upgrade flow. It must say the payment is a demonstration and preserve that meaning at confirmation. Complete the fake upgrade, reload, and confirm the account is Pro with a 25-task cap. Store 25 tasks and confirm a 26th is denied; completion still does not release a slot. Repeat a checkout request key and confirm its deterministic mock receipt and stable stored plan/count.
5. Sign in as a second account. Confirm the first account's list is absent. Try rename, complete, and delete against a known task ID from the first account through the public mutations; each must reject and leave the owner's task unchanged. Sign out and confirm protected reads/writes reject an unauthenticated caller.
6. Open the admin panel as an ordinary user. Confirm the protected query denies access. With a trusted, server-provisioned admin identity, confirm missing permission and `system:access` values other than the exact boolean `true` deny access. With role `admin` and `system:access: true`, confirm the read-only identity overview loads. There are no admin mutation controls.
7. Interrupt or deny a task write and confirm the entered title remains available for retry with a translated error. Watch frontend/Convex terminals for unhandled errors while saving, signing out, and changing accounts. A completed save must refresh the task list and stored plan/count display.
8. Run the [theme/shader recipe](theme-and-transitions.md) and [localization recipe](localization.md). If using injected Layers, record that run as a preview; it does not substitute for the real deployment checks above.

## Evidence and cleanup

Record account role, deployment, revision, actions, returned permission/cap failures, and resulting task/count/plan state under `.verifications/<run>/`. Omit passwords, cookies, bearer tokens, and private auth secrets. Keep screenshots of user-visible results together with backend state evidence; a screenshot alone cannot prove isolation.

Remove only tasks and test accounts created by the run through supported authenticated operations. Keep any real product data. Stop only owned processes and remove temporary agent login credentials after use. A missing deployment or unavailable auth integration is an explicit live-verification gap.
