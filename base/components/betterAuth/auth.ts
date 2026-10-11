import { betterAuth } from "better-auth/minimal";

import { baseAuthOptions } from "../../confect/services/auth/options";

// Static instance for Better Auth schema generation only.
export const auth = betterAuth(baseAuthOptions());
