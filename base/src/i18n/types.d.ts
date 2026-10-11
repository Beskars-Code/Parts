import type english from "./catalogs/en.server";
import type { Locale } from "./config";

declare module "use-intl" {
	interface AppConfig {
		Locale: Locale;
		Messages: (typeof english)["__root"] & (typeof english)["index"];
	}
}
