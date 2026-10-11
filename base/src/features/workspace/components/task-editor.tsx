import { useTranslations } from "use-intl";

function focusInput(input: HTMLInputElement | null) {
	input?.focus();
}

export function TaskEditor({ title, pending, onTitleChange, onSave, onCancel }: {
	readonly title: string;
	readonly pending: boolean;
	readonly onTitleChange: (title: string) => void;
	readonly onSave: () => void;
	readonly onCancel: () => void;
}) {
	const t = useTranslations("todos");
	return <form className="flex min-w-0 flex-1 flex-wrap gap-2" onSubmit={event => { event.preventDefault(); onSave(); }}>
		<label className="min-w-0 flex-1"><span className="mb-1 block text-xs text-muted-foreground">{t("taskTitle")}</span>
			<input className="app-input" value={title} maxLength={200} required ref={focusInput} disabled={pending} onChange={event => { onTitleChange(event.currentTarget.value); }} />
		</label>
		<button className="app-button" type="submit" disabled={pending}>{t(pending ? "saving" : "save")}</button>
		<button className="app-button-secondary" type="button" disabled={pending} onClick={onCancel}>{t("cancel")}</button>
	</form>;
}
