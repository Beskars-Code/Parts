# UI parts

Individually copyable UI and styling references for destination projects. These parts are optional and are not mounted in the base app.

- [Cookie banner](cookie-banner/README.md): Apollo's floating consent banner, adapted to React callbacks, destination theme tokens, and blank policy links.
- [DitherCN styling](dithercn/README.md): an integration reference for theme-aware dithered backgrounds, chart fills, text, and images. Install selected upstream source in the destination; no engine or components are vendored here.

## Tell an agent to import a part

```text
Bring over ui/cookie-banner from Parts. Read its README, copy its component,
stylesheet, and English catalog, and connect its callbacks to this project's
consent owner. Keep policy links blank until I supply their destinations.
Do not import Apollo's provider, settings sheets, or legal pages.
Verify the result on mobile and desktop in this project.
```

Each part owns its source, styles, copy, dependencies, and integration instructions. Select only the requested part. Reuse compatible destination components and theme tokens, preserve accessibility, and verify the adapted UI in the destination.

For styling references such as DitherCN, follow the part's destination installation guide rather than copying this catalog folder as runtime code.

When adding another part, give it an owning `ui/<part>/` folder and README, then add it to this collection. A shared runtime registry or an installation tool is not required.
