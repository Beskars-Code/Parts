import * as Effect from "effect/Effect";
import { useState } from "react";

import { TodoService } from "../../../../services/todos/service";
import { useServiceRequest } from "../../../services/application/use-service-request";

import type { Task } from "../../../../services/todos/service";

export function useTaskRow(task: Task) {
	const [editing, setEditing] = useState(false);
	const [title, setTitle] = useState(task.title);
	const request = useServiceRequest();
	const edit = () => { setTitle(task.title); setEditing(true); };
	const rename = () => request.run(TodoService.pipe(Effect.flatMap(todos => todos.rename(task.id, title))), () => { setEditing(false); });
	const setCompleted = () => request.run(TodoService.pipe(Effect.flatMap(todos => todos.setCompleted(task.id, !task.completed))));
	const remove = () => request.run(TodoService.pipe(Effect.flatMap(todos => todos.remove(task.id))));
	return { editing, setEditing, title, setTitle, edit, rename, setCompleted, remove, ...request };
}
