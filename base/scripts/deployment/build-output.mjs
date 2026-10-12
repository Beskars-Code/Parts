import { realpath, rm } from "node:fs/promises";
import path from "node:path";

async function existingAncestor(candidate) {
	try {
		return await realpath(candidate);
	} catch (error) {
		if (error.code !== "ENOENT") {
			throw new Error("Build output could not be resolved safely. Check the destination's generated output paths.");
		}
		return existingAncestor(path.dirname(candidate));
	}
}

export async function clearProviderOutput(provider) {
	const root = await realpath(".");
	for (const relativePath of provider.outputPaths) {
		const target = path.resolve(relativePath);
		const ancestor = await existingAncestor(target);
		if (!target.startsWith(`${root}${path.sep}`) || (ancestor !== root && !ancestor.startsWith(`${root}${path.sep}`))) {
			throw new Error("Provider build output must remain inside the current destination before it can be cleared.");
		}
		await rm(target, { recursive: true, force: true });
	}
}
