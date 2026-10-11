import { createServerFn } from "@tanstack/react-start";
import { setCookie } from "@tanstack/react-start/server";

import localeConfig from "./config";
import resolveLocale from "./resolve-locale";

export const setLocale = createServerFn({ method: "POST" })
	.validator((value: unknown) => {
		if (typeof value !== "string") {
			throw new TypeError("Unknown locale preference");
		}
		const locale = resolveLocale(value);
		if (locale !== value) {
			throw new Error("Unknown locale preference");
		}
		return locale;
	})
	.handler(({ data }) => {
		setCookie(localeConfig.cookieName, data, { path: "/", maxAge: localeConfig.cookieMaxAge, sameSite: "lax" });
	});
