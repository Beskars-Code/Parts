export default function rule(message, create) {
	return {
		meta: {
			type: "problem",
			schema: [],
			messages: { violation: message },
		},
		create,
	};
}
