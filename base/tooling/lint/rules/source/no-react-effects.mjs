import reference from "../../ast/reference.mjs";
import staticName from "../../ast/static-name.mjs";
import rule from "../../rule.mjs";

const effects = new Set(["useEffect", "useLayoutEffect", "useInsertionEffect", "useImperativeHandle"]);

function report(context, node, binding) {
	if (binding?.source === "react" && effects.has(binding.name)) {
		context.report({ node, messageId: "violation" });
	}
}

function destructured(context, node) {
	if (node.id.type !== "ObjectPattern") {
		return;
	}
	const binding = reference(context, node.init);
	for (const property of node.id.properties) {
		report(context, property, { source: binding?.source, name: staticName(property.key) });
	}
}

function importSpecifier(context, node, specifier) {
	if (specifier.importKind !== "type") {
		report(context, specifier, { source: node.source.value, name: staticName(specifier.imported ?? specifier.local) });
	}
}

export default rule("React effects are banned. Derive during render, use event handlers, reset with a key, or subscribe with useSyncExternalStore.", (context) => ({
		ImportDeclaration(node) {
			if (node.importKind !== "type") {
				for (const specifier of node.specifiers) {
					importSpecifier(context, node, specifier);
				}
			}
		},
		ExportNamedDeclaration(node) {
			if (node.source && node.exportKind !== "type") {
				for (const specifier of node.specifiers) {
					importSpecifier(context, node, specifier);
				}
			}
		},
		CallExpression(node) {
			if (node.callee.type !== "MemberExpression") {
				report(context, node, reference(context, node.callee));
			}
		},
		MemberExpression: (node) => report(context, node, reference(context, node)),
		VariableDeclarator: (node) => destructured(context, node),
	}));
