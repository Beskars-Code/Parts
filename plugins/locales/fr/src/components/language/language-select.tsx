import { useRouter } from "@tanstack/react-router";
import { useTransition } from "react";
import { useLocale, useTranslations } from "use-intl";

import localeConfig from "../../i18n/config";
import resolveLocale from "../../i18n/resolve-locale";
import { setLocale } from "../../i18n/set-locale";

export function LanguageSelect() {
	const router = useRouter();
	const locale = useLocale();
	const t = useTranslations("language");
	const [isPending, startTransition] = useTransition();
	return (
		<label className="inline-flex items-center gap-3 text-sm text-muted-foreground">
			<span>{t("label")}</span>
			<select
				className="min-h-11 rounded-md border border-input bg-background px-3 py-2 text-foreground"
				value={locale}
				disabled={isPending}
				onChange={(event) => {
					const choice = resolveLocale(event.currentTarget.value);
					if (choice === locale) {
						return;
					}
					startTransition(async () => {
						await setLocale({ data: choice });
						await router.invalidate();
					});
				}}
			>
				{localeConfig.locales.map((supportedLocale) => (
					<option key={supportedLocale} value={supportedLocale}>{supportedLocale.toUpperCase()}</option>
				))}
			</select>
		</label>
	);
}
