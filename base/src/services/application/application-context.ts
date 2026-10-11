import { createContext } from "react";

import type { ApplicationStore } from "./application-store";
import type { ErrorCode } from "./use-service-request";

export const ApplicationContext = createContext<{
	readonly store: ApplicationStore;
	readonly isAuthenticated: boolean;
	readonly isLoading: boolean;
	readonly sessionError: ErrorCode | null;
} | null>(null);
