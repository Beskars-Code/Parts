import * as Effect from "effect/Effect";
import { useState } from "react";

import { TodoService } from "../../../../services/todos/service";
import { useServiceRequest } from "../../../services/application/use-service-request";

export function useCreateTask() {
	const [title, setTitle] = useState("");
	const request = useServiceRequest();
	const create = () => request.run(TodoService.pipe(Effect.flatMap(todos => todos.create(title))), () => { setTitle(""); });
	return { title, setTitle, create, ...request };
}
