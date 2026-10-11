import resolveValue from "./bindings.mjs";
import policy from "./policy.mjs";
import reference from "../../ast/reference.mjs";

const nativeFunctions = new Set(["alert", "confirm", "prompt", "window.alert", "window.confirm", "window.prompt", "globalThis.alert", "globalThis.confirm", "globalThis.prompt"]);
const nativeWrites = new Set(["document.title", "document.body.textContent", "document.body.innerText", "document.body.innerHTML"]);
const elementWrites = new Set(["textContent", "innerText", "innerHTML"]);
const toastSources = new Set(["sonner", "react-hot-toast"]);

function toast(context, node, binding, check) {
	if (!toastSources.has(binding?.source)) {
		return false;
	}
	if (binding.name === "promise") {
		check(node.arguments[1], node, true);
		return true;
	}
	if (policy.toastMethods.has(binding.name)) {
		check(node.arguments[0], node);
		check(node.arguments[1], node, true);
	}
	return true;
}

function configured(context, node, binding, check) {
	const sinks = context.options[0]?.additionalFunctions ?? [];
	const sink = sinks.find((entry) => entry.source === binding?.source && entry.name === binding?.name);
	const positions = sink?.arguments ?? [];
	for (const index of positions) {
		check(node.arguments[index], node);
	}
}

function call(context, node, check) {
	const binding = reference(context, node.callee);
	if (nativeFunctions.has(binding?.global)) {
		check(node.arguments[0], node);
		check(node.arguments[1], node);
		return;
	}
	if (!toast(context, node, binding, check)) {
		configured(context, node, binding, check);
	}
}

function elementWrite(context, node, check) {
	const target = resolveValue(context, node.left);
	if (target?.type !== "MemberExpression") {
		return;
	}
	const name = target.computed ? target.property.value : target.property.name;
	if (elementWrites.has(name)) {
		check(node.right, node);
	}
}

function write(context, node, check) {
	if (nativeWrites.has(reference(context, node.left)?.global)) {
		check(node.right, node);
		return;
	}
	elementWrite(context, node, check);
}

export default function callVisitors(context, check) {
	return {
		CallExpression: (node) => call(context, node, check),
		AssignmentExpression: (node) => write(context, node, check),
	};
}
