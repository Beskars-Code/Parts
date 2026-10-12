import { nitro } from "nitro/vite";
import { defineConfig } from "vite";

import { createBaseViteConfig } from "../../vite.config";

export default defineConfig(environment => createBaseViteConfig(environment, {
	afterStart: [nitro({ preset: "vercel", vercel: { functions: { runtime: "nodejs24.x" } } })],
}));
