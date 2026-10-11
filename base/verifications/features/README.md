# Feature verification map

Populate this index from the destination's routes, commands, and product behavior. Each feature recipe states the real entry point, caller role, data prerequisites, harness actions, meaningful result, side effects, recovery, and gotchas.

Start with the project's important flows, including agent admin login and billing when those modules are selected. A recipe becomes verified only after it runs against the real destination app. Do not invent runnable flows for Parts itself.

| Base recipe | Behavior to verify in the destination |
| --- | --- |
| [Development startup and agent login](development-startup.md) | Ordered generation, selected-dev aggregate startup, port refusal, owned cleanup, and guarded local/hosted application-admin session |
| [Todo starter](starter.md) | Real sign-up/sign-in, persisted task CRUD, owner isolation, strict admin access, and fake 5-to-25-task upgrade |
| [Theme and transitions](theme-and-transitions.md) | Persisted Light/Dark/System choice, page blur, theme reveal, reduced-motion and unsupported-browser fallbacks |
| [Localization](localization.md) | English SSR/hydration, typed namespace messages, unsupported cookie fallback, and opt-in French persistence |
| [Optional native shell](native-shell.md) | Existing localhost server in development, reviewed HTTPS release target, real WebView auth/task continuation, and minimum native permissions |
