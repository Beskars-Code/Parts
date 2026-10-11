import resolveValue from "./bindings.mjs";
import policy from "./policy.mjs";
import staticName from "../../ast/static-name.mjs";

function attributeValue(node) {
	return node.value?.type === "JSXExpressionContainer" ? node.value.expression : node.value;
}

function attribute(context, element, name) {
	const value = element.attributes.find((entry) => staticName(entry.name) === name);
	return resolveValue(context, attributeValue(value ?? {}))?.value;
}

function isButtonValue(context, element) {
	return staticName(element.name) === "input" && ["button", "submit", "reset"].includes(attribute(context, element, "type"));
}

function metaContent(context, element) {
	if (staticName(element.name) !== "meta") {
		return false;
	}
	const name = attribute(context, element, "name") ?? attribute(context, element, "property");
	return policy.descriptiveMetadata.has(name);
}

function namedCopy(context, name) {
	const configured = context.options[0]?.additionalAttributes ?? [];
	return policy.copyProperties.has(name) || configured.some((entry) => entry.toLowerCase() === name);
}

function copyAttribute(context, node, name) {
	if (namedCopy(context, name)) {
		return true;
	}
	return name === "value" ? isButtonValue(context, node.parent) : name === "content" && metaContent(context, node.parent);
}

function checkAttribute(context, node, check) {
	const name = String(staticName(node.name)).toLowerCase();
	const collections = context.options[0]?.additionalCollectionProps ?? [];
	if (policy.collectionProperties.has(name) || collections.some((entry) => entry.toLowerCase() === name)) {
		check(attributeValue(node), node, true);
		return;
	}
	if (copyAttribute(context, node, name)) {
		check(attributeValue(node), node);
	}
}

function expression(node, check) {
	if (node.parent.type === "JSXElement" || node.parent.type === "JSXFragment") {
		check(node.expression, node);
	}
}

export default function jsxVisitors(context, check) {
	return {
		JSXText(node) {
			if (node.value.trim() !== "") {
				context.report({ node, messageId: "violation" });
			}
		},
		JSXAttribute: (node) => checkAttribute(context, node, check),
		JSXSpreadAttribute: (node) => check(node.argument, node, true),
		JSXExpressionContainer: (node) => expression(node, check),
	};
}
