import { createFileRoute, getRouteApi } from "@tanstack/react-router";
import { createTranslator } from "use-intl";

import localeConfig from "../i18n/config";
import { I18nProvider } from "../i18n/i18n-provider";
import { getHomeMessages } from "../i18n/requests/index";
import { HomePage } from "../pages/home/home-page";

const rootRoute = getRouteApi("__root__");

function HomeRoute() {
	const { messages: shellMessages } = rootRoute.useLoaderData();
	const { locale, messages } = Route.useLoaderData();
	return (
		<I18nProvider locale={locale} messages={{ ...shellMessages, ...messages }}>
			<HomePage />
		</I18nProvider>
	);
}

export const Route = createFileRoute("/")({
	component: HomeRoute,
	loader: () => getHomeMessages(),
	head: ({ loaderData }) => {
		if (loaderData === undefined) {
			return {};
		}
		const { locale, messages } = loaderData;
		const t = createTranslator({ locale, messages, namespace: "home", timeZone: localeConfig.timeZone });
		return { meta: [{ title: t("title") }] };
	},
});
