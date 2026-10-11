import { convexBetterAuthReactStart } from "@convex-dev/better-auth/react-start";

const convexUrl = process.env["VITE_CONVEX_URL"];
const convexSiteUrl = process.env["VITE_CONVEX_SITE_URL"];

function createServer() {
	if (convexUrl === undefined || convexSiteUrl === undefined) { return null; }
	try {
		return convexBetterAuthReactStart({ convexUrl, convexSiteUrl });
	} catch {
		return null;
	}
}

const authServer = createServer();

export default authServer;
