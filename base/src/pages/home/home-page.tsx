import { useTranslations } from "use-intl";

import { SetupState } from "./setup-state";
import { RequestError } from "../../components/feedback/request-error";
import { AuthForm } from "../../features/auth/auth-form";
import { Workspace } from "../../features/workspace/workspace";
import { useApplication } from "../../services/application/use-application";

export function HomePage() {
	const t = useTranslations("home");
	const application = useApplication();
	if (application === null) {return <main className="mx-auto max-w-xl px-4 py-10"><SetupState /></main>;}
	if (application.isLoading) {return <main className="mx-auto max-w-xl px-4 py-16"><p role="status" className="text-sm text-muted-foreground">{t("loading")}</p></main>;}
	if (application.sessionError !== null && !application.isAuthenticated) {return <main className="mx-auto max-w-xl px-4 py-16"><RequestError code={application.sessionError} /><button className="app-button-secondary mt-3" type="button" onClick={() => { application.store.refresh(); }}>{t("retry")}</button></main>;}
	return (
		<main className="mx-auto max-w-2xl px-4 pb-12 pt-4 sm:px-6 sm:pb-20">
			{application.isAuthenticated ? <Workspace /> : <><div className="mb-8 text-center"><h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1><p className="mt-2 text-sm text-muted-foreground">{t("description")}</p></div><AuthForm /></>}
		</main>
	);
}
