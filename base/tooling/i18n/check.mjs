import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = process.argv[2] ?? fileURLToPath(new URL("../../", import.meta.url));
const localesDirectory = path.join(root, "locales");
const maxCatalogLines = 100;
const maxCatalogBytes = 8 * 1024;
const maxScopeBytes = 16 * 1024;

function isRecord(value) {
	return value !== null && typeof value === "object" && !Array.isArray(value);
}

function readCatalog(file) {
	const content = readFileSync(file, "utf8");
	const lines = content.split(/\r\n|\r|\n/).length - Number(/(?:\r\n|\r|\n)$/.test(content));
	if (lines > maxCatalogLines) {
		throw new Error(`${file}: ${lines} lines exceeds ${maxCatalogLines}. Split whole namespaces into separate catalog files.`);
	}
	const bytes = Buffer.byteLength(content, "utf8");
	if (bytes > maxCatalogBytes) {
		throw new Error(`${file}: ${bytes} bytes exceeds ${maxCatalogBytes}. Split this catalog into smaller files.`);
	}
	const messages = JSON.parse(content);
	if (!isRecord(messages) || Object.keys(messages).length === 0) {
		throw new Error(`${file}: a catalog must contain namespace objects.`);
	}
	return { messages, bytes };
}

function collectKeys(value, prefix, keys) {
	if (typeof value === "string") {
		keys.add(prefix);
		return;
	}
	if (!isRecord(value) || Object.keys(value).length === 0) {
		throw new Error(`${prefix}: expected a message string or a nonempty namespace object.`);
	}
	for (const [key, child] of Object.entries(value)) {
		if (key.includes(".")) {
			throw new Error(`${prefix}.${key}: message keys cannot contain dots. Use nested objects.`);
		}
		collectKeys(child, `${prefix}.${key}`, keys);
	}
}

function addNamespaces(messages, file, namespaces, keys) {
	for (const [namespace, value] of Object.entries(messages)) {
		if (namespace.includes(".") || !isRecord(value)) {
			throw new Error(`${file}: ${namespace} must be a namespace object without dots in its name.`);
		}
		if (namespaces.has(namespace)) {
			throw new Error(`${file}: duplicate namespace ${namespace}, already owned by ${namespaces.get(namespace)}.`);
		}
		namespaces.set(namespace, file);
		collectKeys(value, namespace, keys);
	}
}

function readLocale(directory) {
	const files = readdirSync(directory, { recursive: true }).filter((name) => name.endsWith(".json")).map((name) => name.replaceAll("\\", "/")).toSorted((left, right) => left.localeCompare(right));
	if (files.length === 0) {
		throw new Error(`${directory}: add at least one JSON message catalog.`);
	}
	const scopes = new Map();
	const keysByFile = new Map();
	for (const name of files) {
		const file = path.join(directory, name);
		const scope = path.dirname(name).replaceAll("\\", "/");
		if (scope === ".") {
			throw new Error(`${file}: place catalogs inside their mirrored route scope folder.`);
		}
		const { messages, bytes } = readCatalog(file);
		const previous = scopes.get(scope) ?? { bytes: 0, namespaces: new Map() };
		const scopeBytes = previous.bytes + bytes;
		if (scopeBytes > maxScopeBytes) {
			throw new Error(`${directory}/${scope}: ${scopeBytes} bytes exceeds ${maxScopeBytes}. Keep route payloads small.`);
		}
		const keys = new Set();
		addNamespaces(messages, file, previous.namespaces, keys);
		scopes.set(scope, { bytes: scopeBytes, namespaces: previous.namespaces });
		keysByFile.set(name, keys);
	}
	return keysByFile;
}

function compareKeys(label, keys, english) {
	const missing = [...english].filter((key) => !keys.has(key));
	const extra = [...keys].filter((key) => !english.has(key));
	const issues = [
		...missing.map((key) => `${label}: missing ${key}`),
		...extra.map((key) => `${label}: unknown ${key}`),
	];
	if (issues.length > 0) {
		throw new Error(`Message catalogs must match English:\n${issues.join("\n")}`);
	}
}

function compareLocale(locale, files, english) {
	compareKeys(`${locale} catalog files`, new Set(files.keys()), new Set(english.keys()));
	for (const [file, keys] of files) {
		const reference = english.get(file);
		if (reference !== undefined) {
			compareKeys(`${locale}/${file}`, keys, reference);
		}
	}
}

const locales = readdirSync(localesDirectory, { withFileTypes: true }).filter((entry) => entry.isDirectory()).map((entry) => entry.name).toSorted((left, right) => left.localeCompare(right));
const keysByLocale = new Map(locales.map((locale) => [locale, readLocale(path.join(localesDirectory, locale))]));
const english = keysByLocale.get("en");
if (english === undefined) {
	throw new Error("English message catalogs are required in locales/en/.");
}
for (const [locale, keys] of keysByLocale) {
	compareLocale(locale, keys, english);
}
process.stdout.write(`i18n: ${english.size} route catalog files match across ${locales.join(", ")}; maximum ${maxCatalogLines} lines and ${maxCatalogBytes} bytes per file, ${maxScopeBytes} bytes per scope.\n`);
