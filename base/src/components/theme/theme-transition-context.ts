import { createContext } from "react";

import type { ThemeTransitionStore } from "./theme-transition-store";

export const ThemeTransitionContext = createContext<ThemeTransitionStore | null>(null);
