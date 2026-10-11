import { useTranslations } from "use-intl";

import { ThemeSelect } from "../../components/theme/theme-select";

export function HomePage() {
	const t = useTranslations("home");
	return (
		<main className="mx-auto max-w-3xl px-6 py-24">
			<div className="mb-8 flex justify-end">
				<ThemeSelect />
			</div>
			<h1 className="text-3xl font-semibold tracking-tight">{t("title")}</h1>
			<p className="mt-4 text-muted-foreground">{t("description")}</p>
		</main>
	);
}
