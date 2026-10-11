import unicorn from "eslint-plugin-unicorn";

import reference from "../../ast/reference.mjs";
import effectSchema from "../../effect-schema.mjs";

const upstream = unicorn.rules["throw-new-error"];

function schemaErrorFactory(context, callee) {
	const binding = reference(context, callee);
	if (!effectSchema(binding) || binding.name !== "TaggedError") {
		return false;
	}
	const paths = binding.source === "effect/Schema" ? ["TaggedError", "*/TaggedError"] : ["Schema/TaggedError", "*/Schema/TaggedError"];
	return paths.includes((binding.path ?? [binding.name]).join("/"));
}

const throwNewError = {
	...upstream,
	create(context) {
		const listeners = upstream.create(context);
		return {
			...listeners,
			CallExpression(node) {
				if (!schemaErrorFactory(context, node.callee)) {
					listeners.CallExpression(node);
				}
			},
		};
	},
};

export default throwNewError;
