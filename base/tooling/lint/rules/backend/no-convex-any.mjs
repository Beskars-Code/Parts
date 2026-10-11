import reference from "../../ast/reference.mjs";
import rule from "../../rule.mjs";

export default rule("Use a specific Convex validator instead of v.any(). Derive TypeScript types from the validator.", (context) => ({
		CallExpression(node) {
			const binding = reference(context, node.callee);
			if (binding?.source === "convex/values" && binding.name === "any") {
				context.report({ node, messageId: "violation" });
			}
		},
	}));
