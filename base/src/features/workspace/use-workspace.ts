import { useSyncExternalStore } from "react";

import { useApplication } from "../../services/application/use-application";

export function useWorkspace() {
	const application = useApplication();
	if (application === null) {throw new Error("Workspace needs ApplicationProvider");}
	const snapshot = useSyncExternalStore(application.store.subscribe, application.store.getSnapshot, application.store.getServerSnapshot);
	const principal = snapshot.session._tag === "SignedIn" ? snapshot.session.principal : null;
	const sessionError = snapshot.session._tag === "SignedIn" ? snapshot.session.error : null;
	return { ...snapshot, principal, sessionError, refresh: application.store.refresh };
}
