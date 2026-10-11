import { createRootRouteWithContext, HeadContent, Outlet, Scripts } from "@tanstack/react-router";

import { PageTransition } from "../components/page-transition/page-transition";
import { ShaderBackground } from "../components/shader/shader-background";
import { ThemeProvider } from "../components/theme/theme-provider";
import { ThemeSelect } from "../components/theme/theme-select";
import { I18nProvider } from "../i18n/i18n-provider";
import { getRootMessages } from "../i18n/requests/root";
import { ApplicationProvider } from "../services/application/application-provider";
import { getAuthToken } from "../services/auth/get-auth-token";
import stylesheet from "../styles.css?url";

import type { ConvexReactClient } from "convex/react";

function Root() {
	const { locale, messages } = Route.useLoaderData();
	const { convexClient, token } = Route.useRouteContext();
	return (
		<html lang={locale} suppressHydrationWarning>
			<head>
				<HeadContent />
			</head>
			<body>
				<I18nProvider locale={locale} messages={messages}>
					<ThemeProvider attribute="class" defaultTheme="system" enableSystem themes={["light", "dark"]} disableTransitionOnChange>
						<ShaderBackground />
						<div className="relative z-10">
							<header className="mx-auto flex max-w-2xl justify-end px-4 py-5 sm:px-6"><ThemeSelect /></header>
							<ApplicationProvider client={convexClient} initialToken={token}>
								<PageTransition><Outlet /></PageTransition>
							</ApplicationProvider>
						</div>
					</ThemeProvider>
				</I18nProvider>
				<Scripts />
			</body>
		</html>
	);
}

export const Route = createRootRouteWithContext<{ readonly convexClient: ConvexReactClient | null }>()({
	component: Root,
	beforeLoad: async () => ({ token: (await getAuthToken()) ?? null }),
	loader: () => getRootMessages(),
	head: () => ({
			meta: [{ charSet: "utf8" }, { name: "viewport", content: "width=device-width, initial-scale=1" }],
			links: [
				{ rel: "stylesheet", href: stylesheet },
				{ rel: "icon", type: "image/svg+xml", href: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='6' fill='%2318181b'/%3E%3C/svg%3E" },
			],
	}),
});
