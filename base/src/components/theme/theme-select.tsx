import { useTranslations } from "use-intl";

import { useThemeTransition } from "./use-theme-transition";

export function ThemeSelect() {
	const { theme, setTheme } = useThemeTransition();
	const t = useTranslations("theme");
	return (
		<label className="inline-flex items-center gap-3 text-sm text-muted-foreground">
			<span>{t("label")}</span>
			<select
				className="min-h-11 rounded-md border border-input bg-background px-3 py-2 text-foreground"
				value={theme ?? "system"}
				disabled={theme === undefined}
				onChange={(event) => {
					const choice = event.currentTarget.value;
					if (choice !== "light" && choice !== "dark" && choice !== "system") {
						throw new Error("Unknown theme preference");
					}
					setTheme(choice);
				}}
			>
				<option value="light">{t("light")}</option>
				<option value="dark">{t("dark")}</option>
				<option value="system">{t("system")}</option>
			</select>
		</label>
	);
}
