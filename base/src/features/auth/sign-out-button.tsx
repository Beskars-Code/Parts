import * as Effect from "effect/Effect";
import { useTranslations } from "use-intl";

import { RequestError } from "../../components/feedback/request-error";
import { useServiceRequest } from "../../services/application/use-service-request";
import { AuthService } from "../../services/auth/auth-service";

export function SignOutButton() {
	const t = useTranslations("auth");
	const auth = useServiceRequest();
	return <div>
		<button className="app-button-secondary" type="button" disabled={auth.pending} onClick={() => { auth.run(AuthService.pipe(Effect.flatMap(service => service.signOut))); }}>
			{t(auth.pending ? "working" : "signOut")}
		</button>
		<RequestError code={auth.error} />
	</div>;
}
