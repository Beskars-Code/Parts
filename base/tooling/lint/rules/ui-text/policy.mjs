const copyProperties = new Set([
	"title", "description", "label", "message", "text", "caption", "heading", "header",
	"placeholder", "alt", "tooltip", "tooltipcontent", "helpertext", "errormessage", "errortext",
	"emptytext", "emptylabel", "loadingtext", "loadinglabel", "confirmationtext", "arialabel",
	"aria-label", "aria-description", "aria-roledescription", "aria-valuetext", "data-tooltip", "data-tip",
	"submitlabel", "cancellabel", "confirmlabel", "buttontext", "actionlabel", "children",
	"loading", "success", "error", "dangerouslysetinnerhtml", "__html",
]);
const collectionProperties = new Set(["items", "options", "columns", "actions", "action", "cancel", "tabs", "links", "menuitems", "breadcrumbs"]);
const descriptiveMetadata = new Set(["description", "og:title", "og:description", "twitter:title", "twitter:description"]);
const toastMethods = new Set(["toast", "default", "success", "error", "message", "warning", "info", "loading", "custom"]);

const policy = { copyProperties, collectionProperties, descriptiveMetadata, toastMethods };

export default policy;
