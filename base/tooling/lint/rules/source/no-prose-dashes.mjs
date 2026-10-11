import rule from "../../rule.mjs";

const pattern = new RegExp(String.raw`[${String.fromCodePoint(0x20_13, 0x20_14, 0x20_15)}]|&m[d]ash;|&#(?:8212|x2014);|\\u(?:2014|\{2014\})| -{2} `, "giu");

function isNumericRange(text, index, match) {
	return match.codePointAt(0) === 0x20_13 && /\d/.test(text[index - 1] ?? "") && /\d/.test(text[index + 1] ?? "");
}

export default rule("Use a period, comma, colon, parentheses or semicolon instead of prose dashes. Numeric-range en dashes are allowed.", (context) => ({
		Program() {
			const text = context.sourceCode.getText();
			for (const match of text.matchAll(pattern)) {
				if (!isNumericRange(text, match.index, match[0])) {
					context.report({ loc: { start: context.sourceCode.getLocFromIndex(match.index), end: context.sourceCode.getLocFromIndex(match.index + match[0].length) }, messageId: "violation" });
				}
			}
		},
	}));
