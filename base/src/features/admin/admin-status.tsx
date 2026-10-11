import { useTranslations } from "use-intl";

import { useAdminStatus } from "./use-admin-status";
import { RequestError } from "../../components/feedback/request-error";

export function AdminStatus() {
	const t = useTranslations("admin");
	const status = useAdminStatus();
	return <details className="mt-8 border-t border-border pt-4" onToggle={event => { if (event.currentTarget.open) {status.load();} }}>
		<summary className="min-h-11 cursor-pointer py-3 text-sm font-medium">{t("title")}</summary>
		<div className="rounded-lg bg-muted/40 p-4">
			{status.pending ? <p role="status" className="text-sm text-muted-foreground">{t("loading")}</p> : null}
			{status.principal === null ? null : <dl className="grid gap-2 text-sm"><div className="flex flex-wrap justify-between gap-2"><dt className="text-muted-foreground">{t("identity")}</dt><dd className="break-all">{status.principal.email}</dd></div><div className="flex justify-between gap-2"><dt className="text-muted-foreground">{t("access")}</dt><dd>{t("granted")}</dd></div></dl>}
			<RequestError code={status.error} />
			{status.error === null ? null : <button className="app-button-secondary mt-3" type="button" disabled={status.pending} onClick={() => { status.load(); }}>{t("retry")}</button>}
		</div>
	</details>;
}
