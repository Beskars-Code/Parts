import { createServerFn } from "@tanstack/react-start";

import authServer from "./auth-server.server";

export const getAuthToken = createServerFn({ method: "GET" }).handler(async () => {
	if (authServer === null) {return null;}
	try {
		return await authServer.getToken();
	} catch {
		return null;
	}
});
