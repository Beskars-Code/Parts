import * as Effect from "effect/Effect";
import { useState } from "react";

import { useApplication } from "./use-application";

import type { ApplicationServices } from "./application-store";
import type english from "../../i18n/catalogs/en.server";

export type ErrorCode = keyof (typeof english)["index"]["errors"];

export function useServiceRequest() {
	const application = useApplication();
	const [pending, setPending] = useState(false);
	const [error, setError] = useState<ErrorCode | null>(null);
	const run = <A, E extends { readonly _tag: ErrorCode }>(
		operation: Effect.Effect<A, E, ApplicationServices>,
		onSuccess?: (value: A) => void,
	) => {
		if (pending || application === null) {return;}
		setPending(true);
		setError(null);
		const request = operation.pipe(
			Effect.match({
				onFailure: failure => { setError(failure._tag); },
				onSuccess: value => { onSuccess?.(value); application.store.refresh(); },
			}),
			Effect.catchDefect(() => Effect.sync(() => { setError("TransportError"); })),
			Effect.ensuring(Effect.sync(() => { setPending(false); })),
		);
		application.store.run(request);
	};
	return { pending, error, run };
}
