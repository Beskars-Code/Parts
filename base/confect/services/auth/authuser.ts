import * as Schema from "effect/Schema";

export const AuthUser = Schema.Struct({
	_id: Schema.String,
	_creationTime: Schema.Number,
	name: Schema.String,
	email: Schema.String,
	emailVerified: Schema.Boolean,
	image: Schema.String.pipe(Schema.NullOr, Schema.optionalKey),
	createdAt: Schema.Number,
	updatedAt: Schema.Number,
	userId: Schema.String.pipe(Schema.NullOr, Schema.optionalKey),
	permissions: Schema.String.pipe(Schema.NullOr, Schema.optionalKey),
	role: Schema.String.pipe(Schema.NullOr, Schema.optionalKey),
	banned: Schema.Boolean.pipe(Schema.NullOr, Schema.optionalKey),
	banReason: Schema.String.pipe(Schema.NullOr, Schema.optionalKey),
	banExpires: Schema.Number.pipe(Schema.NullOr, Schema.optionalKey),
});

export type AuthUser = typeof AuthUser.Type;
