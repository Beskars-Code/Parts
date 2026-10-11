import staticName from "./static-name.mjs";
import variable from "./variable.mjs";

function imported(definition) {
	const declaration = definition.parent;
	return declaration.importKind === "type" || definition.node.importKind === "type" ? undefined : { source: declaration.source.value, name: importName(definition.node) };
}

function importName(node) {
	if (node.type === "ImportSpecifier") {
		return staticName(node.imported);
	}
	return node.type === "ImportDefaultSpecifier" ? "default" : "*";
}

function identifier(context, node, seen) {
	const binding = variable(context, node);
	if (!binding || binding.defs.length === 0) {
		return { global: node.name };
	}
	if (seen.has(binding)) {
		return;
	}
	seen.add(binding);
	return definitionReference(context, binding.defs[0], seen);
}

function definitionReference(context, definition, seen) {
	if (definition.type === "ImportBinding") {
		return imported(definition);
	}
	if (definition.type === "Variable") {
		return assigned(context, definition, seen);
	}
	return definition.type === "FunctionName" ? { node: definition.node } : undefined;
}

function assigned(context, definition, seen) {
	const resolved = reference(context, definition.node.init, seen);
	if (definition.node.id.type !== "ObjectPattern") {
		return resolved;
	}
	const property = definition.node.id.properties.find((entry) => entry.value?.name === definition.name.name);
	return propertyReference(context, resolved, staticName(property?.key), seen);
}

function member(context, node, seen) {
	const base = reference(context, node.object, seen);
	const name = memberName(context, node, seen);
	return propertyReference(context, base, name, seen);
}

function memberName(context, node, seen) {
	return node.computed ? reference(context, node.property, seen)?.node?.value : staticName(node.property);
}

function propertyReference(context, base, name, seen) {
	if (name === undefined || !base) {
		return;
	}
	if (base.source) {
		return importedMember(base, name);
	}
	return base.global ? { global: `${base.global}.${name}` } : objectProperty(context, base.node, name, seen);
}

function importedMember(base, name) {
	return { source: base.source, name, path: [...(base.path ?? [base.name]), name] };
}

function objectProperty(context, node, name, seen) {
	if (node?.type !== "ObjectExpression") {
		return;
	}
	const property = node.properties.find((entry) => staticName(entry.key) === name);
	return reference(context, property?.value, seen);
}

function expressionReference(context, node, seen) {
	return typeof node.expression === "object" ? reference(context, node.expression, seen) : { node };
}

export default function reference(context, node, seen = new Set()) {
	if (!node) {
		return;
	}
	if (node.type === "Identifier") {
		return identifier(context, node, seen);
	}
	return node.type === "MemberExpression" ? member(context, node, seen) : expressionReference(context, node, seen);
}
