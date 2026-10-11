export default function variable(context, node) {
	let scope = context.sourceCode.getScope(node);
	while (scope) {
		const binding = scope.set.get(node.name);
		if (binding) {
			return binding;
		}
		scope = scope.upper;
	}
	return;
}
