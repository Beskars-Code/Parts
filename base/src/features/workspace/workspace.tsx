import { useTranslations } from "use-intl";

import { useWorkspace } from "./use-workspace";
import { RequestError } from "../../components/feedback/request-error";
import { AdminStatus } from "../admin/admin-status";
import { SignOutButton } from "../auth/sign-out-button";
import { PlanSummary } from "../billing/plan-summary";
import { CreateTaskForm } from "./components/create-task-form";
import { TaskList } from "./components/task-list";

export function Workspace() {
	const t = useTranslations("home");
	const workspace = useWorkspace();
	const isAtLimit = workspace.plan._tag === "Success" && workspace.plan.value.todoCount >= workspace.plan.value.limit;
	const { principal, sessionError } = workspace;
	return <section key={principal?.id} className="rounded-xl border border-border bg-card/95 p-5 shadow-sm sm:p-8">
		<div className="mb-8 flex flex-wrap items-start justify-between gap-4">
			<div><h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>{principal === null ? null : <p className="mt-1 text-sm text-muted-foreground">{principal.email}</p>}</div>
			<SignOutButton />
		</div>
		{sessionError === null ? null : <div className="mb-6 rounded-lg border border-destructive/40 px-4 pb-3">
			<RequestError code={sessionError._tag} />
			<button className="app-button-secondary mt-2" type="button" onClick={() => { workspace.refresh(); }}>{t("retry")}</button>
		</div>}
		<CreateTaskForm atLimit={isAtLimit} />
		<TaskList tasks={workspace.tasks} rows={workspace.taskRows} retry={workspace.refresh} showRetry={sessionError === null} />
		<div className="mt-6"><PlanSummary plan={workspace.plan} retry={workspace.refresh} showRetry={sessionError === null} /></div>
		<AdminStatus />
	</section>;
}
