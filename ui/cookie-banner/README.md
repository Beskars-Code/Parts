# Cookie banner

An implemented React UI template adapted from [Apollo Predictions' cookie banner at revision 846503e7](https://github.com/Beskars-Code/Apollo-Predictions/blob/846503e7fe415f55f8051bdbcc7a5963c25bfdd6/src/features/consent/cookie-banner.tsx).

It keeps the floating bottom panel, typography, equal Reject all / Accept all actions, and Manage cookies action. On mobile it respects the safe area; at desktop widths it sits at the bottom left in a 400px panel. Colors use the destination's semantic theme tokens, with plain CSS fallbacks.

## Copy

- Copy `cookie-banner.tsx` and `cookie-banner.css` together into the destination's component owner, for example `src/components/cookie-banner/`.
- Copy `locales/en/__root/cookie-banner.json` into the destination's matching server-owned locale scope.
- Mount the banner once in the persistent app or public shell, outside page transitions. Show it only while the destination's consent owner requires a choice.

The renderer needs React and a bundler that accepts CSS imports. It has no Next.js, Base UI, Tailwind, cookie-library, or analytics dependency. If the destination requires global styles to be imported from its root, move the stylesheet import there.

## Public entry

`CookieBanner` accepts:

- `copy`: six translated labels described by `CookieBannerCopy`.
- `onConsent(choice)`: receives `{ analytics: false }` for Reject all and `{ analytics: true }` for Accept all.
- `onManageCookies()`: opens the destination's existing cookie settings.
- `privacyPolicyHref`: defaults to `""`. A blank or whitespace-only destination renders inactive text, with no anchor, navigation, or invented policy page.
- `disabled`: defaults to `false`. The destination can disable the three actions while it handles a choice.

The destination owns persistence, showing or hiding the banner, settings, failure recovery, and enabling or disabling analytics. Rendering this UI does not gate tracking. Keep analytics off before consent and connect the callbacks to the actual owner before calling the import integrated. Do not supply no-op handlers for visible actions.

The source has one privacy link and no terms link. No policy pages, provider, cookies, settings sheet, footer, or Apollo-specific cookie name are included.

## Labels in the Parts base

For a banner in the persistent shell, use the existing `__root` scope:

1. Add `locales/en/__root/cookie-banner.json` to the destination.
2. Import that JSON in `src/i18n/catalogs/en.server.ts` and merge it into `english.__root`.
3. The existing `getRootMessages`, root loader, and `I18nProvider` deliver that scope to the client. The existing types derive from the English server registry.
4. Use `useTranslations("cookieBanner")` in the destination wrapper and pass the strings to the renderer. Do not import runtime catalog JSON into a client component.

For an existing narrower public shell scope, merge the namespace there instead. Keep English as the base locale and add another locale only when selected. Run the destination's catalog checks after registration.

```tsx
import { useTranslations } from "use-intl";

import { CookieBanner, type CookieConsentChoice } from "./cookie-banner";

interface DestinationCookieBannerProps {
  readonly consent: CookieConsentChoice | null;
  readonly onConsent: (choice: CookieConsentChoice) => void;
  readonly onManageCookies: () => void;
}

export function DestinationCookieBanner(props: DestinationCookieBannerProps) {
  const t = useTranslations("cookieBanner");
  if (props.consent !== null) { return null; }
  return (
    <CookieBanner
      copy={{
        title: t("title"), description: t("description"),
        rejectAll: t("rejectAll"), acceptAll: t("acceptAll"),
        manageCookies: t("manageCookies"), privacyPolicy: t("privacyPolicy"),
      }}
      onConsent={props.onConsent}
      onManageCookies={props.onManageCookies}
      privacyPolicyHref=""
    />
  );
}
```

The stylesheet uses `--popover`, `--popover-foreground`, `--muted-foreground`, `--secondary`, `--secondary-foreground`, `--muted`, `--border`, and `--ring`. The Parts base already supplies these tokens. Keep the namespaced styles with the part when adapting its controls.

## Verify after importing

- At 390px and desktop widths, check the panel, wrapping, safe-area spacing, 44px action targets, light/dark tokens, and visible keyboard focus.
- Click Reject all, Accept all, and Manage cookies; verify the destination receives the correct choice or opens its settings, then persists or recovers through its own owner.
- With the default blank privacy destination, confirm the text is not a link and cannot navigate. Configure a real destination only when supplied.
- Confirm disabled actions do not submit a surrounding form or invoke callbacks. Respect reduced motion, reduced transparency, and forced colors.

The UI can be previewed independently. Destination consent persistence and actual analytics gating still require destination integration and verification.
