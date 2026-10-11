import { ConvexReactClient } from "convex/react";

export function createApplicationClient() {
	const url = import.meta.env.VITE_CONVEX_URL;
	const siteUrl = import.meta.env.VITE_CONVEX_SITE_URL;
	if (url === undefined || siteUrl === undefined || siteUrl.endsWith(".convex.cloud")) { return null; }
	try {
		new URL(siteUrl);
		return new ConvexReactClient(url);
	} catch {
		return null;
	}
}
