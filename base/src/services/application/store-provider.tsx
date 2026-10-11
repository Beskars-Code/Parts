import { useMemo, useSyncExternalStore } from "react";

import { ApplicationContext } from "./application-context";
import { ApplicationStore } from "./application-store";

import type { ApplicationServices } from "./application-store";
import type * as Layer from "effect/Layer";
import type { ReactNode } from "react";

export function StoreProvider({ children, connect, services, enabled, authLoading }: {
	readonly children: ReactNode;
	readonly connect?: (onChange: () => void) => () => void;
	readonly services: Layer.Layer<ApplicationServices>;
	readonly enabled: boolean;
	readonly authLoading: boolean;
}) {
	const store = useMemo(() => new ApplicationStore(services, connect, enabled), [services, connect, enabled]);
	const snapshot = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);
	const isAuthenticated = snapshot.session._tag === "SignedIn";
	const isLoading = snapshot.session._tag === "Loading" && (authLoading || enabled);
	const sessionError = "error" in snapshot.session ? snapshot.session.error?._tag ?? null : null;
	const value = useMemo(() => ({ store, isAuthenticated, isLoading, sessionError }), [store, isAuthenticated, isLoading, sessionError]);
	return <ApplicationContext.Provider value={value}>{children}</ApplicationContext.Provider>;
}
