export default function staticName(node) {
	return node?.name ?? node?.value;
}
