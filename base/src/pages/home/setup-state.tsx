import { useTranslations } from "use-intl";

export function SetupState() {
	const t = useTranslations("home");
	return <section className="rounded-xl border border-border bg-card/95 p-6 sm:p-8">
		<h1 className="text-2xl font-semibold tracking-tight">{t("setupTitle")}</h1>
		<p className="mt-3 text-sm text-muted-foreground">{t("setupDescription")}</p>
		<ol className="mt-6 list-decimal space-y-3 pl-5 text-sm leading-relaxed"><li>{t("setupUrls")}</li><li>{t("setupBackend")}</li></ol>
		<button className="app-button mt-6" type="button" onClick={() => { location.reload(); }}>{t("setupReload")}</button>
	</section>;
}
