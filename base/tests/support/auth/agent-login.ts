import { execFileSync } from "node:child_process";
import { readFileSync, rmSync, rmdirSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import * as Schema from "effect/Schema";

import type { Browser, Cookie } from "@e2e-dev/web";

const LoginFiles = Schema.fromJsonString(Schema.Struct({
	credentialsFile: Schema.String,
	storageState: Schema.String,
}));

const SessionCookie = Schema.Struct({
	name: Schema.String,
	value: Schema.String,
	domain: Schema.String,
	path: Schema.String,
	expires: Schema.Number,
	httpOnly: Schema.Boolean,
	secure: Schema.Boolean,
	sameSite: Schema.Literals(["Strict", "Lax", "None"]),
});
const SessionCookies = Schema.Array(SessionCookie);
const BrowserState = Schema.fromJsonString(Schema.Struct({ cookies: SessionCookies }));

function loginFiles() {
	const script = fileURLToPath(new URL("../../../scripts/development/agent-login.mjs", import.meta.url));
	try {
		const output = execFileSync(process.execPath, [script], { encoding: "utf8", timeout: 30_000, stdio: ["ignore", "pipe", "pipe"] });
		return Schema.decodeUnknownSync(LoginFiles)(output);
	} catch {
		throw new Error("Agent login failed. Check the running dev app and the prerequisites in instructions/development.md.");
	}
}

function privateDirectory(files: Schema.Schema.Type<typeof LoginFiles>): string {
	const directory = path.dirname(files.storageState);
	if (path.dirname(directory) !== path.resolve(tmpdir()) || !path.basename(directory).startsWith("parts-agent-")) {
		throw new Error("Agent login did not return its private temporary directory.");
	}
	if (files.storageState !== path.join(directory, "browser-state.json") || files.credentialsFile !== path.join(directory, "credentials.json")) {
		throw new Error("Agent login did not return the expected private session files.");
	}
	return directory;
}

function readCookies(file: string): readonly Cookie[] {
	try {
		return Schema.decodeUnknownSync(BrowserState)(readFileSync(file, "utf8")).cookies;
	} catch {
		throw new Error("The private agent session could not be read. No session values were printed.");
	}
}

function removeSession(directory: string): void {
	rmSync(path.join(directory, "credentials.json"), { force: true });
	rmSync(path.join(directory, "browser-state.json"), { force: true });
	rmdirSync(directory);
}

export async function authenticateAgent(browser: Pick<Browser, "setCookies">): Promise<void> {
	const files = loginFiles();
	const directory = privateDirectory(files);
	try {
		await browser.setCookies(readCookies(files.storageState));
	} finally {
		removeSession(directory);
	}
}
