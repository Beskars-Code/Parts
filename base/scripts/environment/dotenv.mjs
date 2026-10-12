import { randomUUID } from "node:crypto";
import { existsSync, readFileSync, renameSync, unlinkSync, writeFileSync } from "node:fs";
import { parseEnv } from "node:util";

import { isAppKey, validateName } from "./catalog.mjs";

export function readDotenv(path) {
	return existsSync(path) ? parseEnv(readFileSync(path, "utf8")) : {};
}

function assignment(name, value) {
	validateName(name);
	if (typeof value !== "string") { throw new TypeError(`Invalid environment variable ${name}.`); }
	if (value.includes("\0")) { throw new Error(`Environment variable ${name} contains an unsupported null character.`); }
	for (const quote of ["'", '"', "`"]) {
		const candidate = `${name}=${quote}${value}${quote}\n`;
		const parsed = parseEnv(candidate);
		if (Object.keys(parsed).length === 1 && parsed[name] === value) { return candidate; }
	}
	throw new Error(`Environment variable ${name} cannot be represented losslessly in dotenv.`);
}

export function serializeDotenv(values) {
	const output = Object.entries(values).map(([name, value]) => assignment(name, value)).join("");
	const parsed = parseEnv(output);
	for (const [name, value] of Object.entries(values)) {
		if (parsed[name] !== value) { throw new Error(`Environment variable ${name} failed dotenv roundtrip validation.`); }
	}
	return output;
}

export function writeFileAtomic(path, content) {
	const temporary = `${path}.${randomUUID()}.tmp`;
	try {
		writeFileSync(temporary, content, { mode: 0o600, flag: "wx" });
		renameSync(temporary, path);
	} finally {
		if (existsSync(temporary)) { unlinkSync(temporary); }
	}
}

export function writeDotenv(path, values) {
	writeFileAtomic(path, serializeDotenv(values));
}

function multilineQuote(line) {
	const matched = /^\s*(?:export\s+)?[A-Za-z_][A-Za-z0-9_]*\s*=\s*(['"`])(.*)$/.exec(line);
	return matched === null || matched[2].includes(matched[1]) ? undefined : matched[1];
}

function commentTail(value) {
	if (!["'", '"', "`"].includes(value[0])) { return value; }
	const end = value.indexOf(value[0], 1);
	return end === -1 ? "" : value.slice(end + 1);
}

function lineComment(line) {
	const matched = /^\s*(?:export\s+)?[A-Za-z_][A-Za-z0-9_]*\s*=(.*)$/.exec(line);
	if (matched === null) { return line.trimStart().startsWith("#") ? line : undefined; }
	const tail = commentTail(matched[1].trimStart());
	const index = tail.indexOf("#");
	return index === -1 ? undefined : tail.slice(index);
}

function commentContext(line, quote) {
	if (quote === undefined) { return { quote: multilineQuote(line), comment: lineComment(line) }; }
	const end = line.indexOf(quote);
	return end === -1 ? { quote } : { comment: lineComment(`CLOSED=${line.slice(end + 1)}`) };
}

function commentLines(content) {
	const comments = [];
	let context = {};
	for (const line of content.split(/\r?\n/)) {
		context = commentContext(line, context.quote);
		if (context.comment !== undefined) { comments.push(context.comment); }
	}
	return comments.join("\n");
}

export function mergeAppDotenv(path, runtime, metadata = {}, source = path) {
	const previous = readDotenv(source);
	const controls = Object.fromEntries(Object.entries(previous).filter(([name]) => !isAppKey(name)));
	const comments = existsSync(source) ? commentLines(readFileSync(source, "utf8")) : "";
	const values = { ...controls, ...metadata, ...runtime };
	writeFileAtomic(path, `${comments}\n${serializeDotenv(values)}`);
}
