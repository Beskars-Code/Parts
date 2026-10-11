import { useTranslations } from "use-intl";

import { RequestError } from "../../../components/feedback/request-error";
import { useCreateTask } from "../hooks/use-create-task";

export function CreateTaskForm({ atLimit }: { readonly atLimit: boolean }) {
	const t = useTranslations("todos");
	const task = useCreateTask();
	return <form className="mb-6" onSubmit={event => { event.preventDefault(); task.create(); }}>
		<label className="mb-2 block text-sm font-medium" htmlFor="new-task">{t("newTask")}</label>
		<div className="flex flex-col gap-2 sm:flex-row">
			<input id="new-task" className="app-input flex-1" autoComplete="off" maxLength={200} required placeholder={t("titlePlaceholder")} value={task.title} disabled={task.pending} onChange={event => { task.setTitle(event.currentTarget.value); }} />
			<button className="app-button sm:min-w-28" type="submit" disabled={task.pending || atLimit}>{t(task.pending ? "adding" : "add")}</button>
		</div>
		{atLimit ? <p className="mt-2 text-sm text-muted-foreground">{t("atLimit")}</p> : null}
		<RequestError code={task.error} />
	</form>;
}
