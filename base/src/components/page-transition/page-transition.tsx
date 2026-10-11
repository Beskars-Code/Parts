import type { ReactNode } from "react";

export function PageTransition({ children }: { readonly children: ReactNode }) {
	return <div className="page-transition">{children}</div>;
}
