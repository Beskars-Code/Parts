# DitherCN styling

An optional styling and integration reference for [dithercn](https://dithercn.dev/docs), a source-owned dither engine for React and shadcn projects. Keep it available for future landing pages, dashboards, and visual treatments. This folder documents how to adopt it; it contains no vendored engine, installed agent skill, or mounted component.

## Choose a treatment

Use dithercn for dithered backgrounds, chart fills, interface accents, display text, or images. Start with the destination's purpose and the requested placement, then consult the [examples](https://dithercn.dev/docs/examples). Install an example when it fits the request; otherwise use its technique to build the requested treatment on the engine.

- Use a WebGL field for an animated background or an effect that varies per pixel.
- Use SVG patterns or CSS masks for static chart, meter, and surface fills.
- Keep headings, labels, chart values, and controls readable and accessible independently of the decoration.

Follow the destination's `docs/design.md`. Reuse its components, spacing, typography, and semantic theme. Record the selected treatment there so later changes keep the same direction.

## Install in the destination

The [upstream installation guide](https://dithercn.dev/docs/installation) requires React 19, Tailwind CSS v4, and a configured shadcn project with `components.json`. The Parts base has the React and Tailwind versions, but does not yet include `components.json`. Configure shadcn for the existing app using its [TanStack Start guide](https://ui.shadcn.com/docs/installation/tanstack), retaining the app's aliases, components, and `src/styles.css` palette.

Run commands in the destination project, never in the Parts catalog. For the Bun-based starter:

```sh
bunx --bun shadcn@latest add https://dithercn.dev/r/dithercn-skill.json
```

This adds the engine and export functions under `lib/dither`, theme variables to the stylesheet named in `components.json`, and the upstream skill with its references under `.agents/skills/dithercn/` and `.claude/skills/dithercn/`. Read the installed skill before implementing a treatment. For an existing project, use its own package runner and preserve its package manager and dependency versions.

For an engine-only import, use this instead:

```sh
bunx --bun shadcn@latest add https://dithercn.dev/r/dither-core.json
```

An individual example also installs its required engine. For example, when a gradient is the selected treatment:

```sh
bunx --bun shadcn@latest add https://dithercn.dev/r/dither-gradient.json
```

Inspect the registry item and its transitive items before importing. Merge dependencies and CSS into their existing owners, retain destination patches, and reuse its existing class-name utility. Decline overwriting an existing utility or customized component; avoid blanket `--overwrite`. Review the resulting diff and retain the destination's own lockfile.

The published `dither-core` registry has 12 direct code files in `lib/dither` at the inspection date below. Its import is source that needs adaptation to Parts' limits, not an exemption: group collaborators by responsibility, update imports, and keep at most 8 direct handwritten code files per folder, 1,000 physical lines per file, and complexity 6. Preserve the engine's public entry while adapting its internals. Do not copy the documentation site's Next.js application or generated files.

## Theme and placement

The [theming guide](https://dithercn.dev/docs/theming) maps `--dither-ink` to `var(--primary)` and `--dither-paper` to `var(--background)`. `--dither-cell` controls the grain. Merge these into the existing light/dark token owners and Tailwind theme declarations; keep the app's persisted Light/Dark/System selection. Scope a different ink or cell size to a section when needed.

Keep decorative layers behind content, outside the tab order, and unable to intercept pointer events. Keep real text as HTML and chart data available without interpreting a pattern. Give WebGL treatments a useful static fallback and preserve reduced-motion, offscreen, and hidden-tab behavior described in the [performance guide](https://dithercn.dev/docs/engine/performance). Prefer static fills for repeated dashboard elements.

Adapt browser-only effects to the destination's client lifecycle so importing a component does not access browser globals during TanStack server rendering. Keep product copy in the destination's route-owned, server-delivered locale catalogs.

## Verify after importing

- Run the destination's build, static checks, and retained tests. In a full Parts-base app, use `bun run build` and `bun run check`; the latter includes structure checks. Resolve imported-source findings without weakening the rules.
- Check the actual placement at phone and desktop widths in light, dark, and system modes. Reload and switch themes to confirm that tokens and the saved selection still work.
- Check reduced motion, a hidden tab, scrolling offscreen and back, and the static fallback when WebGL is unavailable. Confirm the content remains readable.
- Check keyboard focus, pointer interaction, text selection, accessible names, and any chart's equivalent values. Decoration must not block the primary action.
- For an SSR app, load the route directly and check for server-rendering errors, hydration warnings, and browser errors.

Maintain destination recipes in `verifications/` and local evidence in `.verifications/`. Report the installed items, adapted paths, and actual results. This Parts reference does not prove a destination integration.

## Tell an agent to use it

```text
Use ui/dithercn/README.md from Parts for this project's styling.
Read the destination's design rules and inspect its theme and shadcn setup.
Build a quiet dithered hero background with readable HTML text using the
existing theme. Install only the engine, skill, and examples needed for it.
Adapt imported source to this project's structure and strict checks.
Verify it in the destination at phone and desktop widths, in light/dark
mode and with reduced motion and a static fallback.
```

## Sources and status

The [documentation](https://dithercn.dev/docs), [Markdown index](https://dithercn.dev/llms.txt), and published registry items linked above were inspected on 2026-10-26. The index links engine APIs, palettes, motion, export, and examples; docs pages also have `.md` variants.

These are live upstream resources. Recheck their current requirements and inspect the source and license before adopting it. Parts maintains this integration guide, with no upstream source snapshot or dependency pin. No destination installation or visual verification has been performed here.
