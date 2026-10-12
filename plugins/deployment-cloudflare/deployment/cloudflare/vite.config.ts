import { cloudflare } from "@cloudflare/vite-plugin";
import { defineConfig } from "vite";

import { createBaseViteConfig } from "../../vite.config";

export default defineConfig(environment => createBaseViteConfig(environment, {
	beforeStart: [cloudflare({
		configPath: "deployment/cloudflare/wrangler.json",
		viteEnvironment: { name: "ssr" },
		remoteBindings: false,
	})],
}));
