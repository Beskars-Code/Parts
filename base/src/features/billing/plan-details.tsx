import { useTranslations } from "use-intl";

import { usePlanUpgrade } from "./use-plan-upgrade";
import { RequestError } from "../../components/feedback/request-error";

import type { PlanSummary } from "../../../services/billing/service";

export function PlanDetails({ plan }: { readonly plan: PlanSummary }) {
	const t = useTranslations("billing");
	const upgrade = usePlanUpgrade();
	const isDemo = plan.mode === "mock";
	const upgradeAction = isDemo ? "upgrade" : "upgradeLive";
	return <section aria-label={t("label")} className="rounded-lg border border-border bg-muted/40 p-4">
		<div className="flex flex-wrap items-center justify-between gap-3">
			<div><p className="text-sm font-medium">{t(plan.id === "free" ? "free" : "pro")}</p><p className="mt-1 text-sm text-muted-foreground">{t("count", { count: plan.todoCount, limit: plan.limit })}</p></div>
			{plan.id === "free" ? <button className="app-button-secondary border border-border" type="button" disabled={upgrade.pending} onClick={() => { upgrade.upgrade(); }}>{t(upgrade.pending ? "upgrading" : upgradeAction)}</button> : null}
		</div>
		{isDemo ? <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{t("simulation")}</p> : null}
		<RequestError code={upgrade.error} />
	</section>;
}
