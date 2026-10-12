import { frontendPort } from "../frontend-environment.mjs";

const flags = new Map([
	["--local-backend-version", "backendVersion"],
	["--local-cloud-port", "cloudPort"],
	["--local-site-port", "sitePort"],
	["--verbose", "verbose"],
	["-v", "verbose"],
]);

function backendVersion(value) {
	if (!/^[A-Za-z0-9][\w.-]*$/.test(value)) { throw new Error("The backend version must be a version identifier."); }
	return value;
}

function optionValue(field, supplied, remaining) {
	if (field === "verbose") {
		if (supplied !== undefined) { throw new Error("--verbose does not take a value."); }
		return true;
	}
	const value = supplied ?? remaining.next().value;
	if (value === undefined) { throw new Error("A local version or port flag requires a value."); }
	return field === "backendVersion" ? backendVersion(value) : frontendPort(value);
}

function readOption(argument, remaining) {
	const [name, ...parts] = argument.split("=");
	const field = flags.get(name);
	if (field === undefined) {
		throw new Error(`Unsupported startup flag ${name}. Allowed: --local-backend-version, --local-cloud-port, --local-site-port, --verbose.`);
	}
	const supplied = parts.length === 0 ? undefined : parts.join("=");
	return { field, value: optionValue(field, supplied, remaining) };
}

export function startupOptions(argv) {
	const remaining = argv.values();
	const options = { backendVersion: null, cloudPort: null, sitePort: null, verbose: false };
	const seen = new Set();
	for (const argument of remaining) {
		const option = readOption(argument, remaining);
		if (seen.has(option.field)) { throw new Error("A startup flag may only be supplied once."); }
		seen.add(option.field);
		options[option.field] = option.value;
	}
	return options;
}

function localArguments(options, environment) {
	const api = new URL(environment.VITE_CONVEX_URL);
	const site = new URL(environment.VITE_CONVEX_SITE_URL);
	return [
		"--local-cloud-port", api.port || "80", "--local-site-port", site.port || "80",
		...(options.backendVersion === null ? [] : ["--local-backend-version", options.backendVersion]),
	];
}

export function convexArguments(options, target, environment) {
	const args = ["--typecheck", "enable"];
	if (options.verbose) { args.push("--verbose"); }
	if (target.type === "dev") {
		if ([options.backendVersion, options.cloudPort, options.sitePort].some(value => value !== null)) {
			throw new Error("Local backend flags cannot be used with a cloud deployment.");
		}
		return args;
	}
	return [...args, ...localArguments(options, environment)];
}
