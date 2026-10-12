import { spawn, spawnSync } from "node:child_process";

export class DevelopmentProcesses {
	#children = new Set();
	#stopping = false;
	#controller = new AbortController();

	constructor() {
		process.once("SIGINT", () => this.stop(0));
		process.once("SIGTERM", () => this.stop(0));
	}

	get signal() { return this.#controller.signal; }
	get stopping() { return this.#stopping; }

	start(name, args, environment = process.env) {
		this.signal.throwIfAborted();
		const child = spawn(process.execPath, ["--no-env-file", ...args], { stdio: "inherit", env: environment, detached: process.platform !== "win32" });
		this.#children.add(child);
		child.once("error", () => this.#controller.abort(new Error(`${name} could not start. Check the installed destination dependencies.`)));
		child.once("exit", (code, signal) => {
			this.#children.delete(child);
			if (!this.#stopping) {
				this.#controller.abort(new Error(`${name} stopped (${signal ?? code}).`));
			}
		});
		return child;
	}

	async run(name, args, environment = process.env) {
		this.signal.throwIfAborted();
		const child = spawn(process.execPath, ["--no-env-file", ...args], { stdio: "inherit", env: environment, detached: process.platform !== "win32" });
		this.#children.add(child);
		await new Promise((resolve, reject) => {
			child.once("error", () => reject(new Error(`${name} could not start. Install destination dependencies first.`)));
			child.once("exit", code => {
				this.#children.delete(child);
				if (code === 0) { resolve(); } else { reject(new Error(`${name} failed. Fix its diagnostics before starting development.`)); }
			});
		});
	}

	wait(operation) {
		this.signal.throwIfAborted();
		const failure = new Promise((_, reject) => this.signal.addEventListener("abort", () => reject(this.signal.reason), { once: true }));
		return Promise.race([operation(), failure]);
	}

	stop(code) {
		if (this.#stopping) { return; }
		this.#stopping = true;
		this.#controller.abort(new Error("Development processes stopped."));
		for (const child of this.#children) {
			if (process.platform === "win32" && child.pid !== undefined) {
				spawnSync("taskkill", ["/pid", String(child.pid), "/T", "/F"], { stdio: "ignore", windowsHide: true });
			} else if (child.pid !== undefined) {
				process.kill(-child.pid, "SIGTERM");
			}
		}
		process.exitCode = code;
	}
}
