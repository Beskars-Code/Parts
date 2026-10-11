import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

import isGeneratedSource from "./generated-source.mjs";

const maxLines = 1000;
const maxFiles = 8;
const codeExtensions = new Set([
	".js", ".jsx", ".mjs", ".cjs", ".ts", ".tsx", ".mts", ".cts",
	".css", ".scss", ".sass", ".less", ".rs", ".glsl", ".vert", ".frag", ".wgsl",
]);
const excludedDirectories = new Set([
	".git", "node_modules",
	"_generated", "__generated__", "generated",
]);
const excludedOutputs = new Set([
	".output", ".tanstack", ".next", ".turbo", ".cache", ".verifications",
	"dist", "out", "build", "coverage", "target", "src-tauri/target",
]);

function lineCount(source) {
	if (source.length === 0) {
		return 0;
	}
	const lines = source.split(/\r\n|\r|\n/u);
	return lines.at(-1) === "" ? lines.length - 1 : lines.length;
}

function isSourceFile(entry) {
	return entry.isFile() && codeExtensions.has(path.extname(entry.name)) && !isGeneratedSource(entry.name, "");
}

function isSourceDirectory(root, directory, entry) {
	return entry.isDirectory()
		&& !excludedDirectories.has(entry.name)
		&& !excludedOutputs.has(displayPath(root, path.join(directory, entry.name)));
}

function readSource(directory, name) {
	const source = readFileSync(path.join(directory, name), "utf8");
	return { name, source };
}

function isHandwritten(file) {
	return !isGeneratedSource(file.name, file.source);
}

function displayPath(root, filePath) {
	return path.relative(root, filePath).replaceAll("\\", "/") || ".";
}

function fileDiagnostic(root, directory, file) {
	const lines = lineCount(file.source);
	return lines <= maxLines ? [] : [`${displayPath(root, path.join(directory, file.name))}:1:1 warning structure/max-file-lines: ${lines} lines (maximum ${maxLines}). Split this code into cohesive files with clear responsibilities.`];
}

function folderDiagnostic(root, directory, files) {
	return files.length <= maxFiles ? [] : [`${displayPath(root, directory)}:1:1 warning structure/max-folder-files: ${files.length} handwritten code files (maximum ${maxFiles}). Create subfolders by concern, move related files together, and update their imports.`];
}

function scanDirectory(root, directory) {
	const entries = readdirSync(directory, { withFileTypes: true }).toSorted((left, right) => left.name.localeCompare(right.name));
	const files = entries
		.filter((entry) => isSourceFile(entry))
		.map((entry) => readSource(directory, entry.name))
		.filter((file) => isHandwritten(file));
	const diagnostics = [
		...files.flatMap((file) => fileDiagnostic(root, directory, file)),
		...folderDiagnostic(root, directory, files),
	];
	for (const entry of entries) {
		if (!isSourceDirectory(root, directory, entry)) {
			continue;
		}
		diagnostics.push(...scanDirectory(root, path.join(directory, entry.name)));
	}
	return diagnostics;
}

export default function lintStructure(root) {
	return scanDirectory(root, root);
}
