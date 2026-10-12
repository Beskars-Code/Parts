import { access } from "node:fs/promises";

import { requirePackage } from "./command.mjs";
import { cloudflare } from "./providers/cloudflare.mjs";
import { vercel } from "./providers/vercel.mjs";

const providers = new Map([["cloudflare", cloudflare], ["vercel", vercel]]);

export async function requireProvider(name) {
	if (name === undefined) {
		return;
	}
	const provider = providers.get(name);
	if (provider === undefined) {
		throw new Error("Choose a supported hosting provider: vercel or cloudflare.");
	}
	try {
		await access(provider.config);
	} catch {
		throw new Error(`Import plugins/deployment-${name} into deployment/${name} before using this provider.`);
	}
	for (const [dependency, version] of Object.entries(provider.dependencies)) {
		await requirePackage(dependency, version);
	}
	return provider;
}
