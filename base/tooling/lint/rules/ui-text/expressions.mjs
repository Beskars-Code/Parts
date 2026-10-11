import resolveValue from "./bindings.mjs";
import isTranslation, { formatterArguments } from "./intl-calls.mjs";
import policy from "./policy.mjs";
import staticName from "../../ast/static-name.mjs";

function list(context, nodes, seen, collection) {
	return nodes.map((node) => findText(context, node, seen, collection)).find(Boolean);
}

function literal(_context, node) {
	return typeof node.value === "string" && node.value.trim() !== "" ? node : undefined;
}

function template(context, node, seen) {
	const quasi = node.quasis.find((entry) => (entry.value.cooked ?? entry.value.raw).trim() !== "");
	return quasi ?? list(context, node.expressions, seen, false);
}

function conditional(context, node, seen, collection) {
	return list(context, [node.consequent, node.alternate], seen, collection);
}

function logical(context, node, seen, collection) {
	const values = node.operator === "&&" ? [node.right] : [node.left, node.right];
	return list(context, values, seen, collection);
}

function binary(context, node, seen) {
	return node.operator === "+" ? list(context, [node.left, node.right], seen, false) : undefined;
}

function object(context, node, seen, collection) {
	return node.properties.map((entry) => objectValue(context, entry, seen, collection)).find(Boolean);
}

function objectValue(context, property, seen, collection) {
	if (property.type === "SpreadElement") {
		return findText(context, property.argument, seen, collection);
	}
	const name = String(staticName(property.key)).toLowerCase();
	if (collection && !policy.copyProperties.has(name) && !policy.collectionProperties.has(name)) {
		return;
	}
	return findText(context, property.value, seen, collection && policy.collectionProperties.has(name));
}

function array(context, node, seen, collection) {
	return list(context, node.elements, seen, collection);
}

function call(context, node, seen, collection) {
	if (isTranslation(context, node.callee)) {
		return findText(context, node.arguments[1], seen, false);
	}
	const formatted = formatterArguments(context, node);
	if (formatted) {
		return list(context, formatted, seen, false);
	}
	const receiver = node.callee.type === "MemberExpression" ? node.callee.object : node.callee;
	return list(context, [receiver, ...node.arguments], seen, collection);
}

function arrow(context, node, seen, collection) {
	return node.body.type === "BlockStatement"
		? list(context, node.body.body.filter((entry) => entry.type === "ReturnStatement").map((entry) => entry.argument), seen, collection)
		: findText(context, node.body, seen, collection);
}

const handlers = {
	Literal: literal,
	TemplateLiteral: template,
	ConditionalExpression: conditional,
	LogicalExpression: logical,
	BinaryExpression: binary,
	ObjectExpression: object,
	ArrayExpression: array,
	CallExpression: call,
	NewExpression: call,
	MemberExpression: (context, node, seen, collection) => findText(context, node.object, seen, collection),
	ArrowFunctionExpression: arrow,
	FunctionExpression: arrow,
	AwaitExpression: (context, node, seen, collection) => findText(context, node.argument, seen, collection),
};

export default function findText(context, expression, seen = new Set(), isCollection = false) {
	const node = resolveValue(context, expression);
	if (!node || seen.has(node)) {
		return;
	}
	const next = new Set(seen);
	next.add(node);
	return handlers[node.type]?.(context, node, next, isCollection);
}
