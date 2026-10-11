import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react";
import * as Layer from "effect/Layer";
import { useMemo } from "react";

import { ConnectedApplication } from "./adapters/connected-application";
import { ApplicationContext } from "./application-context";
import { StoreProvider } from "./store-provider";
import { authClient } from "../auth/auth-client";

import type { AdminService } from "../../../services/admin/service";
import type { SessionSource } from "../../../services/auth/access";
import type { BillingService } from "../../../services/billing/service";
import type { TodoService } from "../../../services/todos/service";
import type { AuthService } from "../auth/auth-service";
import type { ConvexReactClient } from "convex/react";
import type { ReactNode } from "react";

export interface ApplicationLayers {
	readonly auth?: Layer.Layer<AuthService>;
	readonly todos?: Layer.Layer<TodoService>;
	readonly billing?: Layer.Layer<BillingService>;
	readonly admin?: Layer.Layer<AdminService>;
	readonly session?: Layer.Layer<SessionSource>;
}

interface ProviderProps {
	readonly client: ConvexReactClient | null;
	readonly initialToken: string | null;
	readonly children: ReactNode;
	readonly layers?: ApplicationLayers;
}

const noOverrides: ApplicationLayers = {};

function injectedServices(layers: ApplicationLayers) {
	if ((layers.auth === undefined) || (layers.todos === undefined) || (layers.billing === undefined) || (layers.admin === undefined)) {return null;}
	return layers.session === undefined ? null : Layer.mergeAll(layers.auth, layers.todos, layers.billing, layers.admin, layers.session);
}

export function ApplicationProvider({ client, initialToken, children, layers }: ProviderProps) {
	const injected = useMemo(() => injectedServices(layers ?? noOverrides), [layers]);
	if (injected !== null) {return <StoreProvider services={injected} enabled authLoading={false}>{children}</StoreProvider>;}
	if (client === null) {return <ApplicationContext.Provider value={null}>{children}</ApplicationContext.Provider>;}
	return (
		<ConvexBetterAuthProvider client={client} authClient={authClient} initialToken={initialToken}>
			<ConnectedApplication client={client} {...(layers === undefined ? {} : { layers })}>{children}</ConnectedApplication>
		</ConvexBetterAuthProvider>
	);
}
