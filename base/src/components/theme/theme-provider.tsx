import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useMemo, useSyncExternalStore } from "react";

import { ThemeTransitionContext } from "./theme-transition-context";
import { ThemeTransitionStore } from "./theme-transition-store";

import type { ComponentProps } from "react";

type ThemeProviderProps = ComponentProps<typeof NextThemesProvider>;

/** Class-strategy theme wrapper. Persists preference in localStorage. */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
	const store = useMemo(
		() =>
			new ThemeTransitionStore({
				defaultTheme: props.defaultTheme,
				storageKey: props.storageKey,
				enableSystem: props.enableSystem,
				forcedTheme: props.forcedTheme,
			}),
		[props.defaultTheme, props.storageKey, props.enableSystem, props.forcedTheme],
	);
	const snapshot = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);
	return (
		<ThemeTransitionContext.Provider value={store}>
			<NextThemesProvider {...props} forcedTheme={props.forcedTheme ?? snapshot.resolvedTheme}>
				{children}
			</NextThemesProvider>
		</ThemeTransitionContext.Provider>
	);
}
