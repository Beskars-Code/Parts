import confectContracts from "./rules/backend/confect-contracts.mjs";
import confectQueryBounds from "./rules/backend/confect-query-bounds.mjs";
import convexFileNames from "./rules/backend/convex-file-names.mjs";
import convexValidators from "./rules/backend/convex-validators.mjs";
import deterministicQueries from "./rules/backend/deterministic-queries.mjs";
import noConvexAny from "./rules/backend/no-convex-any.mjs";
import noArrayCallbackReference from "./rules/source/no-array-callback-reference.mjs";
import noProseDashes from "./rules/source/no-prose-dashes.mjs";
import noReactEffects from "./rules/source/no-react-effects.mjs";
import noResultBags from "./rules/source/no-result-bags.mjs";
import noSchemaAny from "./rules/source/no-schema-any.mjs";
import singleMainExport from "./rules/source/single-main-export.mjs";
import throwNewError from "./rules/source/throw-new-error.mjs";
import noHardcodedUiText from "./rules/ui-text/no-hardcoded-ui-text.mjs";

const standards = {
	meta: { name: "parts-standards", version: "1.0.0" },
	rules: {
		"confect-contracts": confectContracts,
		"confect-query-bounds": confectQueryBounds,
		"no-schema-any": noSchemaAny,
		"convex-file-names": convexFileNames,
		"convex-validators": convexValidators,
		"deterministic-queries": deterministicQueries,
		"no-array-callback-reference": noArrayCallbackReference,
		"no-convex-any": noConvexAny,
		"no-prose-dashes": noProseDashes,
		"no-react-effects": noReactEffects,
		"no-result-bags": noResultBags,
		"single-main-export": singleMainExport,
		"throw-new-error": throwNewError,
		"no-hardcoded-ui-text": noHardcodedUiText,
	},
};

export default standards;
