import { writeFile } from "node:fs/promises";

import { getAuthTables } from "better-auth/db";

import { baseAuthOptions } from "../../confect/services/auth/options.ts";
import { createSchema } from "../../node_modules/@convex-dev/better-auth/dist/client/create-schema.js";

// The pinned Convex adapter owns its schema generator; no backend context is needed.
const output = new URL("../../components/betterAuth/generatedSchema.ts", import.meta.url);
const result = await createSchema({ tables: getAuthTables(baseAuthOptions()), file: "generatedSchema.ts" });
await writeFile(output, result.code, "utf8");
console.log("Generated components/betterAuth/generatedSchema.ts from the shared auth options.");
