import * as Schema from "effect/Schema";

export class AuthRequestError extends Schema.TaggedError<AuthRequestError>()("AuthRequestError", {}) {}
