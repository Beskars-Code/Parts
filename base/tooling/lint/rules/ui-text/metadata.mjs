import resolveValue from "./bindings.mjs";
import policy from "./policy.mjs";
import staticName from "../../ast/static-name.mjs";

function ownsMetadata(node) {
	let parent = node.parent;
	while (parent) {
		if (parent.type === "Property" && ["head", "meta"].includes(staticName(parent.key))) {
			return true;
		}
		if (parent.type === "VariableDeclarator" && parent.id.name === "metadata") {
			return true;
		}
		parent = parent.parent;
	}
	return false;
}

function content(context, node) {
	const owner = node.parent;
	if (owner.type !== "ObjectExpression") {
		return false;
	}
	const property = owner.properties.find((entry) => ["name", "property"].includes(staticName(entry.key)));
	return policy.descriptiveMetadata.has(resolveValue(context, property?.value)?.value);
}

function checkProperty(context, node, check) {
	const name = staticName(node.key);
	if (name === "meta") {
		checkMetadata(context, node.value, check);
		return;
	}
	if (!ownsMetadata(node)) {
		return;
	}
	metadataProperty(context, node, check);
}

function metadataProperty(context, property, check) {
	const name = staticName(property.key);
	if (name === "title" || name === "description") {
		check(property.value, property);
		return;
	}
	if (name === "content" && content(context, property)) {
		check(property.value, property);
	}
}

function checkMetadata(context, expression, check, seen = new Set()) {
	const node = resolveValue(context, expression);
	if (!node || seen.has(node)) {
		return;
	}
	const next = new Set(seen);
	next.add(node);
	if (node.type === "ArrayExpression") {
		checkArray(context, node, check, next);
		return;
	}
	if (node.type === "ObjectExpression") {
		checkObject(context, node, check);
	}
}

function checkObject(context, node, check) {
	for (const entry of node.properties) {
		metadataProperty(context, entry, check);
	}
}

function checkArray(context, node, check, seen) {
	for (const entry of node.elements) {
		checkMetadata(context, entry, check, seen);
	}
}

export default function metadataVisitors(context, check) {
	return {
		Property: (node) => checkProperty(context, node, check),
		VariableDeclarator(node) {
			if (node.id.name === "metadata") {
				checkMetadata(context, node.init, check);
			}
		},
	};
}
