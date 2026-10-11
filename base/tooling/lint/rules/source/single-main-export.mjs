import staticName from "../../ast/static-name.mjs";
import rule from "../../rule.mjs";

function isTypeExport(node) {
	return node.exportKind === "type" || ["TSTypeAliasDeclaration", "TSInterfaceDeclaration"].includes(node.declaration?.type);
}

function declarationNames(context, declaration) {
	return declaration.type === "VariableDeclaration" ? context.sourceCode.getDeclaredVariables(declaration).map((binding) => binding.name) : [declaration.id?.name];
}

function exportedNames(context, node) {
	if (isTypeExport(node)) {
		return [];
	}
	return node.declaration ? declarationNames(context, node.declaration) : node.specifiers.filter((specifier) => specifier.exportKind !== "type").map((specifier) => staticName(specifier.exported));
}

export default rule("Keep one main runtime export per app file. Supporting type exports are allowed.", (context) => {
	const exports = new Map();
	return {
		ExportDefaultDeclaration(node) {
			exports.set("default", node);
		},
		ExportNamedDeclaration(node) {
			for (const name of exportedNames(context, node)) {
				exports.set(name, node);
			}
		},
		"Program:exit"() {
			if (exports.size > 1) {
				context.report({ node: exports.values().toArray()[1], messageId: "violation" });
			}
		},
	};
});
