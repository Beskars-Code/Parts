import { web } from "@e2e-dev/web";
import * as Schema from "effect/Schema";

import { requireAgentDeployment } from "./scripts/development/agent-deployment.mjs";
import { frontendEnvironment } from "./scripts/development/frontend-environment.mjs";
import { readEnvironment } from "./scripts/development/read-environment.mjs";

import type { E2EConfig } from "e2e";

const TargetEnvironment = Schema.Struct({ SITE_URL: Schema.String });
const rawEnvironment: unknown = frontendEnvironment(readEnvironment());
requireAgentDeployment(rawEnvironment);
const environment = Schema.decodeUnknownSync(TargetEnvironment)(rawEnvironment);

export default {
	targets: [{ name: "web", engine: web(), app: { url: environment.SITE_URL } }],
	tests: "tests/**/*.e2e.ts",
	output: ".verifications/e2e",
	workers: 1,
	retries: 0,
	cache: "off",
	trace: "off",
	video: "off",
	reporters: ["list"],
} satisfies E2EConfig;
