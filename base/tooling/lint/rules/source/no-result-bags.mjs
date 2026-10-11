import reference from "../../ast/reference.mjs";
import staticName from "../../ast/static-name.mjs";
import rule from "../../rule.mjs";

function check(context, expression) {
	const node = reference(context, expression)?.node;
	if (node?.type !== "ObjectExpression") {
		return;
	}
	if (hasBooleanFlag(context, node)) {
		context.report({ node, messageId: "violation" });
	}
}

function hasBooleanFlag(context, node) {
	const flag = node.properties.find((property) => staticName(property.key) === "success");
	const value = reference(context, flag?.value)?.node;
	return typeof value?.value === "boolean";
}

export default rule("Signal failure by throwing at a boundary, not by returning a success-flag Result bag.", (context) => ({
		ReturnStatement: (node) => check(context, node.argument),
		ArrowFunctionExpression: (node) => check(context, node.body),
	}));
