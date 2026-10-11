import { useTheme } from "next-themes";
import { useCallback, useContext, useSyncExternalStore } from "react";

import { ThemeTransitionContext } from "./theme-transition-context";

type ThemeChoice = "light" | "dark" | "system";

export function useThemeTransition() {
	const store = useContext(ThemeTransitionContext);
	if (store === null) {
		throw new Error("useThemeTransition must be used inside ThemeProvider");
	}
	const { setTheme: persistTheme } = useTheme();
	const snapshot = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);
	const setTheme = useCallback((choice: ThemeChoice) => store.setTheme(choice, persistTheme), [store, persistTheme]);
	return { theme: snapshot.theme, resolvedTheme: snapshot.resolvedTheme, setTheme };
}
