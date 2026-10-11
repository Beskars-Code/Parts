import { useTranslations } from "use-intl";

import { TaskRow } from "./task-row";
import { RequestError } from "../../../components/feedback/request-error";

import type { TodoError, Task } from "../../../../services/todos/service";
import type { QueryResult } from "@confect/react";

export function TaskList({ tasks, rows, retry, showRetry }: {
	readonly tasks: QueryResult.QueryResult<readonly Task[], TodoError>;
	readonly rows: readonly Task[] | null;
	readonly retry: () => void;
	readonly showRetry: boolean;
}) {
	const t = useTranslations("todos");
	if (tasks._tag === "Loading") {return <p className="py-6 text-sm text-muted-foreground" role="status">{t("loading")}</p>;}
	return <>
		{tasks._tag === "Failure" ? <div className="py-4"><RequestError code={tasks.error._tag} />{showRetry ? <button className="app-button-secondary mt-3" type="button" onClick={() => { retry(); }}>{t("retry")}</button> : null}</div> : null}
		{rows === null ? null : <ul aria-label={t("listLabel")} className="divide-y divide-border">{rows.map(task => <TaskRow key={task.id} task={task} />)}</ul>}
	</>;
}
