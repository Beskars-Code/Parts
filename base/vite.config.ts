import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
	clearScreen: false,
	plugins: [
		tailwindcss(),
		tanstackStart({
			importProtection: {
				behavior: "error",
				client: { files: ["**/locales/**"] },
			},
		}),
		react(),
	],
	resolve: { tsconfigPaths: true },
	server: {
		port: 3000,
		strictPort: true,
		forwardConsole: {
			unhandledErrors: true,
			logLevels: ["log", "info", "warn", "error", "debug"],
		},
	},
});
