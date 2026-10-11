export default function effectSchema(binding) {
	return binding ? binding.source === "effect/Schema" || (binding.source === "effect" && binding.path?.includes("Schema")) : false;
}
