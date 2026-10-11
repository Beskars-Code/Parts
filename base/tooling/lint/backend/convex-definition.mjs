import reference from "../ast/reference.mjs";
import staticName from "../ast/static-name.mjs";

const standard = new Set(["query", "internalQuery", "mutation", "internalMutation", "action", "internalAction"]);
const authenticated = new Set(["authedQuery", "authedMutation", "authedAction", "adminQuery", "adminMutation", "adminAction"]);

function registrar(context, node) {
	const callee = node.callee.type === "CallExpression" ? node.callee.callee : node.callee;
	const binding = reference(context, callee);
	if (!binding?.source) {
		return;
	}
	return isRegistrar(binding, node) ? binding.name : undefined;
}

function isRegistrar(binding, node) {
	return standard.has(binding.name) ? /(?:^convex\/server$|\/_generated\/server(?:\.[cm]?[jt]s)?$)/.test(binding.source) : isAuthenticated(binding, node);
}

function isAuthenticated(binding, node) {
	const isFactory = binding.name.startsWith("authed");
	const isInvoked = node.callee.type === "CallExpression";
	return (!isFactory || isInvoked) && authenticated.has(binding.name) && /(?:^|\/)customfunctions(?:\.[cm]?[jt]s)?$/i.test(binding.source);
}

export default function convexDefinition(context, node) {
	const name = registrar(context, node);
	if (!name) {
		return;
	}
	const options = node.arguments[0];
	if (options?.type !== "ObjectExpression") {
		return { name, fields: [] };
	}
	const fields = options.properties.filter((property) => property.type === "Property");
	return { name, fields, handler: handlerNode(context, fields) };
}

function handlerNode(context, fields) {
	const handler = fields.find((property) => staticName(property.key) === "handler");
	return reference(context, handler?.value)?.node;
}
