import reference from "../ast/reference.mjs";

function isImplementation(binding) {
	return Boolean(binding?.source) && binding.name === "make" && /^@confect\/server(?:\/FunctionImpl)?$/.test(binding.source);
}

function isQuerySpec(context, node) {
	const spec = reference(context, node);
	return /(?:^|\/)query\.spec(?:\.[jt]s)?$/.test(spec?.source ?? "");
}

export default function confectQuery(context, node) {
	const binding = reference(context, node.callee);
	if (!isImplementation(binding) || !isQuerySpec(context, node.arguments[1])) {
		return;
	}
	return reference(context, node.arguments[3])?.node;
}
