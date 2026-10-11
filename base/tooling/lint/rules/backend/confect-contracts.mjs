import reference from "../../ast/reference.mjs";
import staticName from "../../ast/static-name.mjs";
import walk from "../../ast/walk.mjs";
import confectDefinition from "../../backend/confect-definition.mjs";
import effectSchema from "../../effect-schema.mjs";
import rule from "../../rule.mjs";

function invalidReturn(context, node) {
	const binding = reference(context, node);
	return effectSchema(binding) && ["Void", "Undefined", "Any"].includes(binding.name);
}

function checkReturn(context, field) {
	const schema = reference(context, field.value)?.node;
	walk(
		schema,
		(node) => {
			if (invalidReturn(context, node)) {
				context.report({ node, messageId: "violation" });
			}
		},
		{ ...context.sourceCode.visitorKeys, ObjectExpression: [] },
	);
}

export default rule("Confect functions need a specific returns schema (item for paginated queries). Use Schema.Null instead of Void or Undefined; omitted args already validate an empty object.", (context) => ({
		CallExpression(node) {
			const definition = confectDefinition(context, node);
			if (!definition) {
				return;
			}
			const key = definition.name.includes("Paginated") ? "item" : "returns";
			const field = definition.fields.find((property) => staticName(property.key) === key);
			if (!field) {
				context.report({ node, messageId: "violation" });
				return;
			}
			checkReturn(context, field);
		},
	}));
