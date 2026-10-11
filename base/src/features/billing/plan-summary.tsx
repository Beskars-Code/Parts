import { useTranslations } from "use-intl";

import { PlanDetails } from "./plan-details";
import { RequestError } from "../../components/feedback/request-error";

import type { NotAuthenticated } from "../../../services/auth/access";
import type { PlanSummary as Plan } from "../../../services/billing/service";
import type { TransportError } from "../../../services/errors/transport-error";
import type { QueryResult } from "@confect/react";

export function PlanSummary({ plan, retry, showRetry }: {
	readonly plan: QueryResult.QueryResult<Plan, NotAuthenticated | TransportError>;
	readonly retry: () => void;
	readonly showRetry: boolean;
}) {
	const t = useTranslations("billing");
	if (plan._tag === "Loading") {return <p className="text-sm text-muted-foreground" role="status">{t("loading")}</p>;}
	if (plan._tag === "Failure") {return <div><RequestError code={plan.error._tag} />{showRetry ? <button className="app-button-secondary mt-3" type="button" onClick={() => { retry(); }}>{t("retry")}</button> : null}</div>;}
	return <PlanDetails plan={plan.value} />;
}
