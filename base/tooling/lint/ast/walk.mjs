function walkChild(value, visitor, keys) {
	if (Array.isArray(value)) {
		for (const child of value) {
			walk(child, visitor, keys);
		}
		return;
	}
	walk(value, visitor, keys);
}

export default function walk(node, visitor, keys) {
	if (!node) {
		return;
	}
	visitor(node);
	const children = keys[node.type] ?? [];
	for (const key of children) {
		walkChild(node[key], visitor, keys);
	}
}
