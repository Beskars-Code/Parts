import { defineSchema } from "convex/server";

import { tables } from "./generatedSchema";

// Custom fields live in Better Auth options (user.additionalFields), not here.
const schema = defineSchema({
	...tables,
});

export default schema;
