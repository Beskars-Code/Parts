import { useTranslations } from "use-intl";

import { useAuthForm } from "./use-auth-form";
import { RequestError } from "../../components/feedback/request-error";

export function AuthForm() {
	const t = useTranslations("auth");
	const auth = useAuthForm();
	const isCreating = auth.mode === "sign-up";
	const action = t(isCreating ? "signUp" : "signIn");
	return (
		<section className="mx-auto w-full max-w-sm rounded-xl border border-border bg-card/95 p-6 shadow-sm sm:p-8">
			<h2 className="text-xl font-semibold">{action}</h2>
			<form className="mt-6 space-y-4" onSubmit={event => { event.preventDefault(); auth.submit(); }}>
				{isCreating ? <label className="block space-y-2 text-sm font-medium">
					<span>{t("name")}</span>
					<input className="app-input" name="name" autoComplete="name" required maxLength={100} value={auth.name} disabled={auth.pending} onChange={event => { auth.setName(event.currentTarget.value); }} />
				</label> : null}
				<label className="block space-y-2 text-sm font-medium">
					<span>{t("email")}</span>
					<input className="app-input" type="email" name="email" autoComplete="email" required value={auth.email} disabled={auth.pending} onChange={event => { auth.setEmail(event.currentTarget.value); }} />
				</label>
				<label className="block space-y-2 text-sm font-medium">
					<span>{t("password")}</span>
					<input className="app-input" type="password" name="password" autoComplete={isCreating ? "new-password" : "current-password"} required minLength={8} maxLength={128} value={auth.password} disabled={auth.pending} onChange={event => { auth.setPassword(event.currentTarget.value); }} />
				</label>
				<RequestError code={auth.error} />
				<button className="app-button w-full" type="submit" disabled={auth.pending}>
					{auth.pending ? t("working") : action}
				</button>
			</form>
			<button className="app-button-secondary mt-4 w-full" type="button" disabled={auth.pending} onClick={() => { auth.setMode(auth.mode === "sign-in" ? "sign-up" : "sign-in"); }}>
				{t(auth.mode === "sign-in" ? "switchToSignUp" : "switchToSignIn")}
			</button>
		</section>
	);
}
