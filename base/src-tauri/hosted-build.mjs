import { spawnSync } from "node:child_process";

function hostedTarget() {
	const value = process.env.SITE_URL;
	if (value === undefined) {
		throw new Error("Set SITE_URL to the hosted HTTPS application");
	}
	const target = new URL(value);
	if (target.protocol !== "https:") {
		throw new Error("SITE_URL must use HTTPS");
	}
	if (target.hostname.endsWith(".invalid")) {
		throw new Error("Replace the placeholder SITE_URL");
	}
	if (target.username !== "" || target.password !== "") {
		throw new Error("SITE_URL must not contain credentials");
	}
	return target.href;
}

const target = hostedTarget();
const config = JSON.stringify({ build: { frontendDist: target } });
const result = spawnSync("bun", ["--bun", "run", "tauri", "build", "--config", config], {
	stdio: "inherit",
	env: { ...process.env, SITE_URL: target },
});
if (result.error !== undefined) {
	throw result.error;
}
process.exitCode = result.status ?? 1;
