import { useTranslations } from "use-intl";

import type { ErrorCode } from "../../services/application/use-service-request";

export function RequestError({ code }: { readonly code: ErrorCode | null }) {
	const t = useTranslations("errors");
	return code === null ? null : <p role="alert" className="mt-3 text-sm text-destructive">{t(code)}</p>;
}
