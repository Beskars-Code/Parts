import callVisitors from "./calls.mjs";
import findText from "./expressions.mjs";
import jsxVisitors from "./jsx.mjs";
import metadataVisitors from "./metadata.mjs";
import isGeneratedSource from "../../structure/generated-source.mjs";

const stringList = { type: "array", items: { type: "string" }, uniqueItems: true };
const options = {
	type: "object",
	properties: {
		additionalAttributes: stringList,
		additionalCollectionProps: stringList,
		additionalFunctions: {
			type: "array",
			items: {
				type: "object",
				properties: { source: { type: "string" }, name: { type: "string" }, arguments: { type: "array", items: { type: "integer", minimum: 0 }, uniqueItems: true } },
				required: ["source", "name", "arguments"],
				additionalProperties: false,
			},
		},
	},
	additionalProperties: false,
};

const noHardcodedUiText = {
	meta: {
		type: "problem",
		schema: [options],
		messages: { violation: "Move user-facing text to a message catalog and render it through use-intl." },
	},
	create(context) {
		if (isGeneratedSource(context.filename, context.sourceCode.getText())) {
			return {};
		}
		const reported = new Set();
		function check(expression, sink, isCollection = false) {
			if (reported.has(sink) || !findText(context, expression, new Set(), isCollection)) {
				return;
			}
			reported.add(sink);
			context.report({ node: sink, messageId: "violation" });
		}
		return { ...jsxVisitors(context, check), ...callVisitors(context, check), ...metadataVisitors(context, check) };
	},
};

export default noHardcodedUiText;
