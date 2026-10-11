import unicorn from "eslint-plugin-unicorn";

import reference from "../../ast/reference.mjs";

const upstream = unicorn.rules["no-array-callback-reference"];
const nonArrayMethodPaths = new Map([
	["effect/Cause", ["map", "*/map"]],
	["effect/Option", ["filter", "*/filter"]],
	["effect", ["Cause/map", "*/Cause/map", "Option/filter", "*/Option/filter"]],
]);

function nonArrayExport(binding) {
	const path = (binding.path ?? [binding.name]).join("/");
	return nonArrayMethodPaths.get(binding.source)?.includes(path) === true;
}

function nonArrayMethod(context, callee) {
	const binding = reference(context, callee);
	return binding !== undefined && nonArrayExport(binding);
}

const noArrayCallbackReference = {
	...upstream,
	create(context) {
		const listeners = upstream.create(context);
		return {
			...listeners,
			CallExpression(node) {
				if (!nonArrayMethod(context, node.callee)) {
					listeners.CallExpression(node);
				}
			},
		};
	},
};

export default noArrayCallbackReference;
