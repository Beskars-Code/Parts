# Theme and transitions

Run against the copied destination app. The starter's `/` route has a labeled Theme select; no login or backend data is required. For page motion, use two real destination routes and a client-side link. If the destination still has one route, report page navigation as unverified rather than claiming a theme switch proves it.

## Drive

1. Open `/` and select Dark, then Light. Confirm both the visible palette and the single resolved root class. With normal motion in a supporting browser, the new theme reveals through the root polygon; page content does not run a second blur animation.
2. Reload after selecting a mode. Confirm the saved localStorage `theme` preference returns and the picker agrees with the palette after hydration.
3. Select System and change the OS/browser color scheme. Confirm the palette updates with the same theme reveal. Switch explicitly to Light or Dark, change the OS scheme again, and confirm the explicit preference remains.
4. Change themes quickly and confirm the final selection wins. Check the development terminal for unhandled transition errors. Open another tab on the same origin, change the saved choice, and confirm the first tab follows it.
5. Navigate between two real routes. Changing content should blur/fade with slight scaling over 500ms; persistent chrome should stay still. Confirm TanStack's `defaultViewTransition: true` starts the native transition and `PageTransition` supplies the named `page` DOM capture, with no second React transition engine.
6. Repeat with reduced motion enabled. Page navigation should use a short opacity-only fade; theme changes should be immediate. In a browser without typed theme-transition support, confirm choices still apply without animation.
7. Inspect a server-rendered document before hydration: without a resolved mode class, the CSS OS fallback must provide the correct palette. After hydration, the provider owns the saved preference and resolved class.
8. Observe the decorative background in Light and Dark. The quiet light field should use those same grayscale tokens, stay behind content, and receive no pointer or keyboard input. Resize and confirm it still fills the viewport. In reduced-motion mode it must be static; in a hidden tab it must schedule no animation frames. Returning to a visible tab should resume normal motion without a time jump.
9. In a browser session with WebGL disabled, reload and confirm the normal themed CSS background and usable app remain. Simulate WebGL context loss where the harness supports it and confirm the canvas hides. Unmount/reconnect the root in a development check and confirm shader listeners, observers, scheduled frames, and GPU resources are cleaned up without duplicate animation loops.

## Evidence and recovery

Record origin, browser support, motion setting, OS scheme, saved choice, resolved root class, and observed navigation/theme results under `.verifications/<run>/`. A still screenshot proves palette state, not an animation; use a recording or browser animation inspection for motion. Missing a second route or required browser support is an explicit gap.

Restore the prior saved theme and browser settings. Stop only processes started by this run.
