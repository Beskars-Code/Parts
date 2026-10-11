import resolveValue from "./bindings.mjs";
import reference from "../../ast/reference.mjs";
import staticName from "../../ast/static-name.mjs";


const factories = new Set(["useTranslations", "createTranslator"]);
const formatterFactories = new Set(["useFormatter", "createFormatter"]);
const methods = new Set(["rich", "markup", "raw"]);
const formatterMethods = new Set(["number", "dateTime", "relativeTime", "list", "dateTimeRange", "displayName"]);

function factory(context, target, names = factories) {
	if (target?.type !== "CallExpression") {
		return false;
	}
	const imported = reference(context, target.callee);
	return imported?.source === "use-intl" && names.has(imported.name);
}

function methodObject(target) {
	return target.type === "MemberExpression" && methods.has(staticName(target.property)) ? target.object : undefined;
}

export default function isTranslation(context, callee) {
	let target = resolveValue(context, callee);
	const seen = new Set();
	while (target && !seen.has(target)) {
		seen.add(target);
		if (factory(context, target)) {
			return true;
		}
		target = resolveValue(context, methodObject(target));
	}
	return false;
}

function memberName(context, callee) {
	return callee.computed ? resolveValue(context, callee.property)?.value : staticName(callee.property);
}

export function formatterArguments(context, node) {
	const callee = resolveValue(context, node.callee);
	if (callee?.type !== "MemberExpression") {
		return;
	}
	const name = memberName(context, callee);
	if (!formatterMethods.has(name)) {
		return;
	}
	const owner = resolveValue(context, callee.object);
	if (!factory(context, owner, formatterFactories)) {
		return;
	}
	return name === "list" ? node.arguments.slice(0, 1) : [];
}
