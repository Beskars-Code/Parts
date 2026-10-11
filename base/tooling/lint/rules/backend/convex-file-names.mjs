import rule from "../../rule.mjs";

export default rule("Convex filenames and folders must use lowercase letters, without hyphens or underscores. Keep framework suffixes such as auth.config.ts.", (context) => ({
		Program(node) {
			const path = context.filename.replaceAll("\\", "/").split("/convex/").at(-1);
			const parts = path.split("/");
			const file = parts.pop().replace(/\.[cm]?[jt]sx?$/, "");
			const names = [...parts, ...file.split(".")];
			if (names.some((name) => !/^[a-z]+$/.test(name))) {
				context.report({ node, messageId: "violation" });
			}
		},
	}));
