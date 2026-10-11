import { createFileRoute } from "@tanstack/react-router";

import authServer from "../../../services/auth/auth-server.server";

function handleAuth(request: Request) {
	return authServer === null
		? new Response(null, { status: 503 })
		: authServer.handler(request);
}

export const Route = createFileRoute("/api/auth/$")({
	server: { handlers: {
		GET: ({ request }) => handleAuth(request),
		POST: ({ request }) => handleAuth(request),
	} },
});
