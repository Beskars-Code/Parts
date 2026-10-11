import { useTranslations } from "use-intl";

import { TaskEditor } from "./task-editor";
import { RequestError } from "../../../components/feedback/request-error";
import { useTaskRow } from "../hooks/use-task-row";

import type { Task } from "../../../../services/todos/service";

export function TaskRow({ task }: { readonly task: Task }) {
	const t = useTranslations("todos");
	const row = useTaskRow(task);
	return <li className="border-b border-border py-3 last:border-b-0">
		<div className="flex items-start gap-2">
			<label className="flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-md focus-within:ring-2 focus-within:ring-ring">
				<input className="size-5 accent-primary" type="checkbox" checked={task.completed} disabled={row.pending} aria-label={t(task.completed ? "markIncomplete" : "markComplete", { title: task.title })} onChange={() => { row.setCompleted(); }} />
			</label>
			{row.editing ? <TaskEditor title={row.title} pending={row.pending} onTitleChange={row.setTitle} onSave={row.rename} onCancel={() => { row.setEditing(false); }} /> : <span className={`min-w-0 flex-1 break-words py-2.5 text-sm ${task.completed ? "text-muted-foreground line-through" : "text-foreground"}`}>{task.title}</span>}
			{row.editing ? null : <details className="relative shrink-0">
				<summary className="flex min-h-11 min-w-11 cursor-pointer list-none items-center justify-center rounded-md border border-transparent text-muted-foreground hover:border-border focus-visible:ring-2 focus-visible:ring-ring" aria-label={t("actions", { title: task.title })}>
					<svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="currentColor"><circle cx="5" cy="12" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="19" cy="12" r="2" /></svg>
				</summary>
				<div className="absolute right-0 z-20 mt-1 grid min-w-36 gap-1 rounded-lg border border-border bg-popover p-1 shadow-md">
					<button className="app-button-secondary justify-start" type="button" disabled={row.pending} onClick={row.edit}>{t("edit")}</button>
					<button className="app-button-secondary justify-start text-destructive" type="button" disabled={row.pending} onClick={() => { row.remove(); }}>{t(row.pending ? "deleting" : "delete")}</button>
				</div>
			</details>}
		</div>
		<RequestError code={row.error} />
	</li>;
}
