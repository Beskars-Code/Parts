import { IntlProvider } from "use-intl";

import localeConfig from "./config";

import type { Locale } from "./config";
import type { ReactNode } from "react";
import type { AbstractIntlMessages } from "use-intl";

export function I18nProvider({ children, locale, messages }: { readonly children: ReactNode; readonly locale: Locale; readonly messages: AbstractIntlMessages }) {
	return <IntlProvider locale={locale} messages={messages} timeZone={localeConfig.timeZone}>{children}</IntlProvider>;
}
