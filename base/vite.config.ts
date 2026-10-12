import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

import type { ConfigEnv, PluginOption, UserConfig } from "vite";

interface AdapterPlugins { beforeStart?: PluginOption[]; afterStart?: PluginOption[] }
const serveEnvironment = { command: "serve" } satisfies Pick<ConfigEnv, "command">;
const noAdapters: AdapterPlugins = {};

export function createBaseViteConfig(
	{ command }: Pick<ConfigEnv, "command"> = serveEnvironment,
	{ beforeStart = [], afterStart = [] }: AdapterPlugins = noAdapters,
): UserConfig {
	return {
	envDir: command === "build" ? false : ".",
	envPrefix: ["NEXT_", "PUBLIC_", "VITE_"],
	clearScreen: false,
	plugins: [
		tailwindcss(),
		...beforeStart,
		tanstackStart({
			importProtection: {
				behavior: "error",
				client: { files: ["**/locales/**"] },
			},
		}),
		...afterStart,
		react(),
	],
	resolve: { tsconfigPaths: true },
	ssr: { noExternal: ["@convex-dev/better-auth"] },
	server: {
		port: 3000,
		strictPort: true,
		forwardConsole: {
			unhandledErrors: true,
			logLevels: ["log", "info", "warn", "error", "debug"],
		},
	},
	};
}

export default defineConfig(environment => createBaseViteConfig(environment));
