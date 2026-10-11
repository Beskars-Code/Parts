import reference from "../ast/reference.mjs";

const constructors = new Set(["publicQuery", "publicPaginatedQuery", "internalQuery", "internalPaginatedQuery", "publicMutation", "internalMutation", "publicAction", "internalAction"]);

export default function confectDefinition(context, node) {
	const binding = reference(context, node.callee);
	if (!binding?.source || !constructors.has(binding.name) || !/^@confect\/core(?:\/FunctionSpec)?$/.test(binding.source)) {
		return;
	}
	return definitionFields(binding.name, node.arguments[0]);
}

function definitionFields(name, options) {
	const fields = options?.type === "ObjectExpression" ? options.properties.filter((property) => property.type === "Property") : [];
	return { name, fields };
}
