import { getCookie, setResponseHeader } from "@tanstack/react-start/server";

import catalogs from "./catalogs/catalogs.server";
import localeConfig from "./config";
import resolveLocale from "./resolve-locale";

import type english from "./catalogs/en.server";

export function loadCatalog<Scope extends keyof typeof english>(scope: Scope) {
	setResponseHeader("Cache-Control", "private, no-store");
	const locale = resolveLocale(getCookie(localeConfig.cookieName));
	return { locale, messages: catalogs[locale][scope] };
}
