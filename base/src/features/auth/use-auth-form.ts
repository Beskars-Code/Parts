import * as Effect from "effect/Effect";
import { useState } from "react";

import { useServiceRequest } from "../../services/application/use-service-request";
import { AuthService } from "../../services/auth/auth-service";

export function useAuthForm() {
	const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const request = useServiceRequest();
	const submit = () => request.run(AuthService.pipe(Effect.flatMap(auth => mode === "sign-in"
		? auth.signIn(email, password)
		: auth.signUp(name, email, password))), () => { setPassword(""); });
	return { mode, setMode, name, setName, email, setEmail, password, setPassword, submit, ...request };
}
