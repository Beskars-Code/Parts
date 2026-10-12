import { chmod, mkdtemp, rm, rmdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

export async function withPrivateJson(values, operation) {
	const directory = await mkdtemp(path.join(tmpdir(), "parts-hosting-"));
	const file = path.join(directory, "runtime.json");
	try {
		await chmod(directory, 0o700);
		await writeFile(file, JSON.stringify(values), { encoding: "utf8", mode: 0o600, flag: "wx" });
		return await operation(file);
	} finally {
		await rm(file, { force: true });
		await rmdir(directory);
	}
}
