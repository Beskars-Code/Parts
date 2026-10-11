import reference from "../../ast/reference.mjs";
import walk from "../../ast/walk.mjs";
import confectQuery from "../../backend/confect-query.mjs";
import convexDefinition from "../../backend/convex-definition.mjs";
import rule from "../../rule.mjs";

const nondeterministic = new Set(["Date", "Date.now", "Math.random", "crypto.randomUUID", "crypto.getRandomValues", "performance.now", "fetch"]);

function forbidden(context, node) {
	const binding = reference(context, node.callee);
	const name = binding?.global?.replace(/^globalThis\./, "");
	return node.type === "NewExpression" ? name === "Date" && node.arguments.length === 0 : nondeterministic.has(name);
}

function inspect(context, handler, seen) {
	if (!handler || seen.has(handler)) {
		return;
	}
	seen.add(handler);
	walk(handler, (node) => inspectExpression(context, node, seen), context.sourceCode.visitorKeys);
}

function inspectExpression(context, node, seen) {
	checkEffectValue(context, node);
	if (node.type !== "CallExpression" && node.type !== "NewExpression") {
		return;
	}
	if (forbidden(context, node)) {
		context.report({ node, messageId: "violation" });
		return;
	}
	followFunction(context, node, seen);
}

function checkEffectValue(context, node) {
	if (!["MemberExpression", "Identifier"].includes(node.type)) {
		return;
	}
	const binding = reference(context, node);
	if (isEffectClock(binding)) {
		context.report({ node, messageId: "violation" });
	}
}

function isClockModule(binding) {
	return binding ? binding.source === "effect/Clock" || (binding.source === "effect" && binding.path?.includes("Clock")) : false;
}

function isEffectClock(binding) {
	return isClockModule(binding) && ["currentTimeMillis", "currentTimeNanos"].includes(binding.name);
}

function followFunction(context, node, seen) {
	const target = reference(context, node.callee)?.node;
	if (target?.type?.includes("Function")) {
		inspect(context, target, seen);
	}
}

export default rule("Queries must not read clocks, generate randomness, or fetch from the network. Store results on write; converting a stored timestamp is allowed.", (context) => ({
		CallExpression(node) {
			const definition = convexDefinition(context, node);
			if (definition?.name.toLowerCase().endsWith("query")) {
				inspect(context, definition.handler, new Set());
			}
			inspect(context, confectQuery(context, node), new Set());
		},
	}));
