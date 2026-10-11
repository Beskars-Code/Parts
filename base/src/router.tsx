import { createRouter } from "@tanstack/react-router";

import { routeTree } from "./routeTree.gen";
import { createApplicationClient } from "./services/application/config";

export function getRouter() {
	return createRouter({ routeTree, context: { convexClient: createApplicationClient() }, scrollRestoration: true, defaultViewTransition: true });
}

declare module "@tanstack/react-router" {
	interface Register {
		router: ReturnType<typeof getRouter>;
	}
}
