import reference from "../../ast/reference.mjs";
import staticName from "../../ast/static-name.mjs";
import walk from "../../ast/walk.mjs";
import confectQuery from "../../backend/confect-query.mjs";
import rule from "../../rule.mjs";

const databaseSteps = new Set(["table", "index", "query", "scan"]);

function boundedRead(context, node) {
	if (node.type !== "CallExpression" || node.callee.type !== "MemberExpression") {
		return;
	}
	if (staticName(node.callee.property) === "collect" && isDatabaseChain(context, node.callee.object)) {
		context.report({ node, messageId: "violation" });
	}
}

function isDatabaseChain(context, node) {
	const target = reference(context, node)?.node ?? node;
	return target.type === "CallExpression" ? isDatabaseChain(context, target.callee) : isDatabaseMember(context, target);
}

function isDatabaseMember(context, node) {
	return node.type === "MemberExpression" ? databaseSteps.has(staticName(node.property)) || isDatabaseChain(context, node.object) : false;
}

function inspect(context, handler, seen) {
	if (!handler || seen.has(handler)) {
		return;
	}
	seen.add(handler);
	walk(
		handler,
		(node) => {
			boundedRead(context, node);
			followFunction(context, node, seen);
		},
		context.sourceCode.visitorKeys,
	);
}

function followFunction(context, node, seen) {
	if (node.type !== "CallExpression") {
		return;
	}
	const target = reference(context, node.callee)?.node;
	if (isFunction(target)) {
		inspect(context, target, seen);
	}
}

function isFunction(target) {
	return target?.type?.includes("Function");
}

export default rule("Bound Confect query reads with take() or paginate() instead of collect().", (context) => ({
		CallExpression(node) {
			inspect(context, confectQuery(context, node), new Set());
		},
	}));
