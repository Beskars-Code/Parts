import { useId } from "react";

import "./cookie-banner.css";

export interface CookieBannerCopy {
	readonly title: string;
	readonly description: string;
	readonly rejectAll: string;
	readonly acceptAll: string;
	readonly manageCookies: string;
	readonly privacyPolicy: string;
}

export interface CookieConsentChoice {
	readonly analytics: boolean;
}

export interface CookieBannerProps {
	readonly copy: CookieBannerCopy;
	readonly onConsent: (choice: CookieConsentChoice) => void;
	readonly onManageCookies: () => void;
	readonly privacyPolicyHref?: string;
	readonly disabled?: boolean;
}

export function CookieBanner({ copy, onConsent, onManageCookies, privacyPolicyHref = "", disabled = false }: CookieBannerProps) {
	const titleId = useId();
	const privacyHref = privacyPolicyHref.trim();
	return (
		<section className="parts-cookie-banner" aria-labelledby={titleId}>
			<h2 id={titleId} className="parts-cookie-banner__title">{copy.title}</h2>
			<p className="parts-cookie-banner__description">{copy.description}</p>
			<div className="parts-cookie-banner__actions">
				<button
					type="button"
					className="parts-cookie-banner__action"
					disabled={disabled}
					onClick={() => { onConsent({ analytics: false }); }}>
					{copy.rejectAll}
				</button>
				<button
					type="button"
					className="parts-cookie-banner__action"
					disabled={disabled}
					onClick={() => { onConsent({ analytics: true }); }}>
					{copy.acceptAll}
				</button>
			</div>
			<div className="parts-cookie-banner__links">
				<button type="button" className="parts-cookie-banner__quiet" disabled={disabled} onClick={onManageCookies}>
					{copy.manageCookies}
				</button>
				{privacyHref === "" ? (
					<span className="parts-cookie-banner__policy">{copy.privacyPolicy}</span>
				) : (
					<a className="parts-cookie-banner__quiet" href={privacyHref}>{copy.privacyPolicy}</a>
				)}
			</div>
		</section>
	);
}
