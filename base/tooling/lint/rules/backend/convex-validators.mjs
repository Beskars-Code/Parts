import staticName from "../../ast/static-name.mjs";
import convexDefinition from "../../backend/convex-definition.mjs";
import rule from "../../rule.mjs";

export default rule("Convex functions must declare explicit args and returns validators, including authenticated wrappers.", (context) => ({
		CallExpression(node) {
			const definition = convexDefinition(context, node);
			if (!definition) {
				return;
			}
			const names = new Set(definition.fields.map((property) => staticName(property.key)));
			if (!names.has("args") || !names.has("returns")) {
				context.report({ node, messageId: "violation" });
			}
		},
	}));
