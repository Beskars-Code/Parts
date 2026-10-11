import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";

import { PageTransition } from "../components/page-transition/page-transition";
import { ThemeProvider } from "../components/theme/theme-provider";
import { I18nProvider } from "../i18n/i18n-provider";
import { getRootMessages } from "../i18n/requests/root";
import stylesheet from "../styles.css?url";

function Root() {
	const { locale, messages } = Route.useLoaderData();
	return (
		<html lang={locale} suppressHydrationWarning>
			<head>
				<HeadContent />
			</head>
			<body>
				<I18nProvider locale={locale} messages={messages}>
					<ThemeProvider attribute="class" defaultTheme="system" enableSystem themes={["light", "dark"]} disableTransitionOnChange>
						<PageTransition>
							<Outlet />
						</PageTransition>
					</ThemeProvider>
				</I18nProvider>
				<Scripts />
			</body>
		</html>
	);
}

export const Route = createRootRoute({
	component: Root,
	loader: () => getRootMessages(),
	head: () => ({
			meta: [{ charSet: "utf8" }, { name: "viewport", content: "width=device-width, initial-scale=1" }],
			links: [
				{ rel: "stylesheet", href: stylesheet },
				{ rel: "icon", type: "image/svg+xml", href: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='6' fill='%2318181b'/%3E%3C/svg%3E" },
			],
	}),
});
