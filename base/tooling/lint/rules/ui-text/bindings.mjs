import staticName from "../../ast/static-name.mjs";
import variable from "../../ast/variable.mjs";

const wrappers = new Set(["TSAsExpression", "TSTypeAssertion", "TSNonNullExpression", "TSSatisfiesExpression", "ChainExpression", "ParenthesizedExpression"]);

function mutationTarget(node) {
	let target = node;
	while (target.parent?.type === "MemberExpression" && target.parent.object === target) {
		target = target.parent;
	}
	return target;
}

function isMutation(node) {
	const target = mutationTarget(node);
	const parent = target.parent;
	if (!parent) {
		return false;
	}
	return parent.type === "AssignmentExpression" ? parent.left === target : parent.type === "UpdateExpression";
}

function changed(binding) {
	return binding.references.some((entry) => (entry.isWrite() && !entry.init) || isMutation(entry.identifier));
}

function immutableDefinition(context, node) {
	const binding = variable(context, node);
	if (binding?.defs.length !== 1) {
		return;
	}
	const definition = binding.defs[0];
	if (definition.type !== "Variable" || definition.parent.kind !== "const") {
		return;
	}
	return changed(binding) ? undefined : definition;
}

function destructured(context, definition, seen) {
	const declaration = definition.node;
	const property = declaration.id.properties.find((entry) => entry.value?.name === definition.name.name);
	const object = resolveValue(context, declaration.init, seen);
	return objectProperty(context, object, staticName(property?.key), seen);
}

function identifier(context, node, seen) {
	const definition = immutableDefinition(context, node);
	if (!definition || seen.has(definition.node)) {
		return node;
	}
	const next = new Set(seen);
	next.add(definition.node);
	return definition.node.id.type === "ObjectPattern"
		? destructured(context, definition, next) ?? node
		: resolveValue(context, definition.node.init, next);
}

function objectProperty(context, object, name, seen) {
	if (object?.type !== "ObjectExpression") {
		return;
	}
	const property = object.properties.find((entry) => staticName(entry.key) === name);
	return resolveValue(context, property?.value, seen);
}

function member(context, node, seen) {
	const object = resolveValue(context, node.object, seen);
	const name = node.computed ? resolveValue(context, node.property, seen)?.value : staticName(node.property);
	return objectProperty(context, object, name, seen) ?? node;
}

function unwrap(expression) {
	let node = expression;
	while (wrappers.has(node?.type)) {
		node = node.expression;
	}
	return node;
}

function resolveMember(context, node, seen) {
	return node.type === "MemberExpression" ? member(context, node, seen) : node;
}

export default function resolveValue(context, expression, seen = new Set()) {
	const node = unwrap(expression);
	if (!node || seen.has(node)) {
		return node;
	}
	const next = new Set(seen);
	next.add(node);
	return node.type === "Identifier" ? identifier(context, node, next) : resolveMember(context, node, next);
}
