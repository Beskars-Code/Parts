const locales = ["en"] as const;

export type Locale = (typeof locales)[number];

const localeConfig = {
	locales,
	defaultLocale: "en",
	cookieName: "NEXT_LOCALE",
	cookieMaxAge: 31_536_000,
	timeZone: "UTC",
} satisfies { readonly defaultLocale: Locale; readonly locales: readonly Locale[]; readonly cookieName: string; readonly cookieMaxAge: number; readonly timeZone: string };

export default localeConfig;
