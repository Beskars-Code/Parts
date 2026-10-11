import localeConfig from "./config";

import type { Locale } from "./config";

function isLocale(value: string | undefined): value is Locale {
	const supportedLocales: readonly string[] = localeConfig.locales;
	return value !== undefined && supportedLocales.includes(value);
}

export default function resolveLocale(value: string | undefined): Locale {
	return isLocale(value) ? value : localeConfig.defaultLocale;
}
