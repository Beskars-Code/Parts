import { flushSync } from "react-dom";

const COLOR_SCHEME_QUERY = "(prefers-color-scheme: dark)";
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
const TRANSITION_TYPE = "theme";
const DEFAULT_STORAGE_KEY = "theme";

type ThemePreference = "light" | "dark" | "system";
type ResolvedTheme = "light" | "dark";

interface ThemeTransitionOptions {
	readonly defaultTheme?: string | undefined;
	readonly storageKey?: string | undefined;
	readonly enableSystem?: boolean | undefined;
	readonly forcedTheme?: string | undefined;
}

interface ThemeTransitionSnapshot {
	readonly theme: ThemePreference | undefined;
	readonly resolvedTheme: ResolvedTheme | undefined;
}

const EMPTY_SNAPSHOT: ThemeTransitionSnapshot = { theme: undefined, resolvedTheme: undefined };

type StartTypedTransition = (options: StartViewTransitionOptions) => ViewTransition;

function asPreference(value: string | null, isSystemEnabled: boolean): ThemePreference | undefined {
	if (value === "light" || value === "dark") {
		return value;
	}
	return value === "system" && isSystemEnabled ? "system" : undefined;
}

function asResolved(value: string | undefined): ResolvedTheme | undefined {
	return value === "light" || value === "dark" ? value : undefined;
}

function readPreference(storageKey: string, isSystemEnabled: boolean): ThemePreference | undefined {
	try {
		return asPreference(localStorage.getItem(storageKey), isSystemEnabled);
	} catch {
		return undefined;
	}
}

function canUseTypedTransitions(): boolean {
	return typeof document === "object" && typeof document.startViewTransition === "function" && typeof CSS === "object" && CSS.supports("selector(:active-view-transition-type(theme))");
}

function startTypedTransition(options: StartViewTransitionOptions): ViewTransition {
	return document.startViewTransition(options);
}

function transitionStarter(): StartTypedTransition | undefined {
	return matchMedia(REDUCED_MOTION_QUERY).matches || !canUseTypedTransitions() ? undefined : startTypedTransition;
}

function fallbackPreference(isSystemEnabled: boolean): ThemePreference {
	return isSystemEnabled ? "system" : "light";
}

export class ThemeTransitionStore {
	private snapshot: ThemeTransitionSnapshot = EMPTY_SNAPSHOT;
	private readonly serverSnapshot = EMPTY_SNAPSHOT;
	private preference: ThemePreference;
	private systemDark = false;
	private readonly defaultTheme: ThemePreference;
	private readonly storageKey: string;
	private readonly enableSystem: boolean;
	private readonly forcedTheme: ResolvedTheme | undefined;
	private readonly listeners = new Set<() => void>();
	private media: MediaQueryList | undefined;
	private onMediaChange: ((event: MediaQueryListEvent) => void) | undefined;
	private onStorage: ((event: StorageEvent) => void) | undefined;
	private active: ViewTransition | undefined;
	private settleTask: Promise<void> | undefined;
	private revision = 0;

	public readonly getSnapshot = (): ThemeTransitionSnapshot => this.snapshot;

	public readonly getServerSnapshot = (): ThemeTransitionSnapshot => this.serverSnapshot;

	public readonly subscribe = (listener: () => void): (() => void) => {
		this.listeners.add(listener);
		if (this.listeners.size === 1) {
			this.open();
		}
		return () => {
			this.listeners.delete(listener);
			if (this.listeners.size === 0) {
				this.close();
			}
		};
	};

	public constructor(options: ThemeTransitionOptions = {}) {
		this.enableSystem = options.enableSystem !== false;
		this.defaultTheme = asPreference(options.defaultTheme ?? null, this.enableSystem) ?? fallbackPreference(this.enableSystem);
		this.storageKey = options.storageKey ?? DEFAULT_STORAGE_KEY;
		this.forcedTheme = asResolved(options.forcedTheme);
		this.preference = this.defaultTheme;
		this.hydrate();
	}

	private hydrate(): void {
		if (typeof document === "undefined") {
			return;
		}
		this.systemDark = matchMedia(COLOR_SCHEME_QUERY).matches;
		this.preference = readPreference(this.storageKey, this.enableSystem) ?? this.defaultTheme;
		this.commit();
	}

	private open(): void {
		this.hydrate();
		if (typeof document === "undefined") {
			return;
		}
		this.media = matchMedia(COLOR_SCHEME_QUERY);
		this.onMediaChange = (event) => {
			this.handleMedia(event.matches);
		};
		this.media.addEventListener("change", this.onMediaChange);
		this.onStorage = (event) => {
			this.handleStorage(event);
		};
		addEventListener("storage", this.onStorage);
	}

	private close(): void {
		this.revision += 1;
		this.cancelActive();
		if (this.settleTask !== undefined) {
			this.settleTask = undefined;
		}
		if (this.media !== undefined && this.onMediaChange !== undefined) {
			this.media.removeEventListener("change", this.onMediaChange);
		}
		if (this.onStorage !== undefined) {
			removeEventListener("storage", this.onStorage);
		}
		this.media = undefined;
		this.onMediaChange = undefined;
		this.onStorage = undefined;
	}

	private handleMedia(isDark: boolean): void {
		this.systemDark = isDark;
		if (this.enableSystem && this.preference === "system") {
			this.requestVisual();
		}
	}

	private handleStorage(event: StorageEvent): void {
		if (event.key !== this.storageKey) {
			return;
		}
		this.preference = asPreference(event.newValue, this.enableSystem) ?? this.defaultTheme;
		this.requestVisual();
	}

	private resolveColor(): ResolvedTheme {
		if (this.forcedTheme !== undefined) {
			return this.forcedTheme;
		}
		if (this.preference === "light" || this.preference === "dark") {
			return this.preference;
		}
		return this.systemDark ? "dark" : "light";
	}

	private commit(): void {
		this.snapshot = { theme: this.preference, resolvedTheme: this.resolveColor() };
		for (const listener of this.listeners) {
			listener();
		}
	}

	private requestVisual(): void {
		this.revision += 1;
		const revision = this.revision;
		this.cancelActive();
		const resolved = this.resolveColor();
		if (resolved === this.snapshot.resolvedTheme && this.preference === this.snapshot.theme) {
			return;
		}
		const start = resolved === this.snapshot.resolvedTheme ? undefined : transitionStarter();
		if (start === undefined) {
			this.commitIfLatest(revision);
			return;
		}
		this.startVisual(start, revision);
	}

	private startVisual(start: StartTypedTransition, revision: number): void {
		try {
			const transition = start({
				update: () => {
					flushSync(() => this.commitIfLatest(revision));
				},
				types: [TRANSITION_TYPE],
			});
			this.active = transition;
			this.settleTask = this.settle(transition);
		} catch {
			this.commitIfLatest(revision);
		}
	}

	private async settle(transition: ViewTransition): Promise<void> {
		try {
			await transition.ready;
		} catch {
			this.release(transition);
		}
		try {
			await transition.finished;
		} catch {
			this.release(transition);
		}
		this.release(transition);
	}

	private commitIfLatest(revision: number): void {
		if (revision === this.revision) {
			this.commit();
		}
	}

	private cancelActive(): void {
		if (this.active === undefined) {
			return;
		}
		this.active.skipTransition();
		this.active = undefined;
	}

	private release(transition: ViewTransition): void {
		if (this.active === transition) {
			this.active = undefined;
		}
	}

	public setTheme(next: ThemePreference, persist: (next: ThemePreference) => void): void {
		this.preference = next;
		persist(next);
		this.requestVisual();
	}
}
