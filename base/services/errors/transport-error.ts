import * as Schema from "effect/Schema";

export class TransportError extends Schema.TaggedError<TransportError>()("TransportError", { message: Schema.String }) {}
