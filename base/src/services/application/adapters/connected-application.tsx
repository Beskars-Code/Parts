import { useConvexAuth } from "convex/react";
import * as Layer from "effect/Layer";
import { useMemo } from "react";

import { ConvexServices } from "./remote-services";
import { BetterAuthLive } from "../../auth/better-auth";
import { StoreProvider } from "../store-provider";

import type { ApplicationLayers } from "../application-provider";
import type { ConvexReactClient } from "convex/react";
import type { ReactNode } from "react";

const noOverrides: ApplicationLayers = {};

export function ConnectedApplication({ client, children, layers }: {
	readonly client: ConvexReactClient;
	readonly children: ReactNode;
	readonly layers?: ApplicationLayers;
}) {
	const { isAuthenticated, isLoading } = useConvexAuth();
	const overrides = layers ?? noOverrides;
	const remote = useMemo(() => new ConvexServices(client), [client]);
	const services = useMemo(() => Layer.mergeAll(
		overrides.auth ?? BetterAuthLive, overrides.todos ?? remote.todos, overrides.billing ?? remote.billing,
		overrides.admin ?? remote.admin, overrides.session ?? remote.session,
	), [remote, overrides]);
	const isEnabled = isAuthenticated || overrides.session !== undefined;
	const isAuthLoading = overrides.session === undefined && isLoading;
	return <StoreProvider connect={remote.subscribe} services={services} enabled={isEnabled} authLoading={isAuthLoading}>{children}</StoreProvider>;
}
