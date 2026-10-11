import reference from "../../ast/reference.mjs";
import effectSchema from "../../effect-schema.mjs";
import rule from "../../rule.mjs";

function check(context, node, expression) {
	const binding = reference(context, expression);
	if (effectSchema(binding) && binding.name === "Any") {
		context.report({ node, messageId: "violation" });
	}
}

export default rule("Use a specific Effect Schema instead of Schema.Any. Preserve schema-derived types at Confect boundaries.", (context) => ({
		MemberExpression(node) {
			check(context, node, node);
		},
		ImportSpecifier(node) {
			check(context, node, node.local);
		},
	}));
