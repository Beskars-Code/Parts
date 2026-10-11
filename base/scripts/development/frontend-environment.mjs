export function frontendPort(value = "3000") {
	const port = value;
	if (!/^\d+$/.test(port)) {
		throw new Error("PORT must be an integer TCP port.");
	}
	const numericPort = Number(port);
	if (numericPort < 1 || numericPort > 65_535) {
		throw new Error("PORT is outside the TCP port range.");
	}
	return port;
}

function configuredSiteUrl(environment) {
	const siteUrl = environment.VITE_CONVEX_SITE_URL;
	if (siteUrl === undefined || siteUrl === "") {
		throw new Error("Configure VITE_CONVEX_SITE_URL for a local or self-hosted backend.");
	}
	return siteUrl;
}

function convexSiteUrl(environment) {
	if (environment.VITE_CONVEX_URL === undefined || environment.VITE_CONVEX_URL === "") {
		throw new Error("Convex must write VITE_CONVEX_URL before the frontend starts.");
	}
	const url = new URL(environment.VITE_CONVEX_URL);
	if (!url.hostname.endsWith(".convex.cloud")) {
		return configuredSiteUrl(environment);
	}
	if (url.protocol !== "https:") {
		throw new Error("A Convex cloud URL must use HTTPS.");
	}
	url.hostname = url.hostname.replace(/\.convex\.cloud$/, ".convex.site");
	return url.origin;
}

export function frontendEnvironment(environment) {
	const port = frontendPort(environment.PORT);
	return {
		...environment,
		PORT: port,
		SITE_URL: `http://localhost:${port}`,
		VITE_CONVEX_SITE_URL: convexSiteUrl(environment),
	};
}
