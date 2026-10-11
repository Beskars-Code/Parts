// Pure catalog diff: Stripe vs the code catalog. Ported from Apollo-Labs lib/stripe/catalog-diff.ts minus tiered / metered / one-time price handling.
export { PRODUCTS } from "../../confect/services/billing/catalog.ts";

const describeValue = (label, stripeValue, catalogValue) => `${label}: stripe ${JSON.stringify(stripeValue)} catalog ${JSON.stringify(catalogValue)}`;

const fieldChange = (label, stripeValue, catalogValue) => (stripeValue === catalogValue ? undefined : describeValue(label, stripeValue, catalogValue));

const productTaxCode = (product) => (typeof product.tax_code === "string" ? product.tax_code : (product.tax_code?.id ?? undefined));

const priceInterval = (price) => price.recurring?.interval ?? null;

export function productMismatchChanges(config, stripeProduct) {
	return [
		fieldChange("name", stripeProduct.name, config.name),
		fieldChange("description", stripeProduct.description ?? "", config.description),
		fieldChange("tax_code", productTaxCode(stripeProduct), config.taxCode),
	].filter((change) => change !== undefined);
}

export function priceMismatchChanges(config, stripePrice) {
	return [
		fieldChange("unit_amount", stripePrice.unit_amount, config.amount),
		fieldChange("currency", stripePrice.currency, config.currency),
		fieldChange("interval", priceInterval(stripePrice), config.interval),
		fieldChange("nickname", stripePrice.nickname ?? "", config.nickname),
	].filter((change) => change !== undefined);
}

// Only these drifts require replacing the (immutable) price. Nickname alone is mutable.
export function priceImmutableChanges(config, stripePrice) {
	return priceMismatchChanges(config, stripePrice).filter((change) => !change.startsWith("nickname:"));
}

export function listAllProducts(stripe) {
	return Array.fromAsync(stripe.products.list({ limit: 100 }));
}

export async function findProductByLookupKey(stripe, lookupKey) {
	const all = await listAllProducts(stripe);
	const matches = all.filter((product) => product.metadata?.lookup_key === lookupKey);
	return matches.find((product) => product.active) ?? matches.at(0);
}

export async function findPriceByLookupKey(stripe, lookupKey) {
	const listed = await stripe.prices.list({ lookup_keys: [lookupKey], limit: 10 });
	return listed.data.find((price) => price.active) ?? listed.data.at(0);
}

export function listPricesForProduct(stripe, productId) {
	return Array.fromAsync(stripe.prices.list({ product: productId, limit: 100 }));
}

const formatDrift = (drift) => {
	const head = `${drift.kind}: ${drift.lookupKey}`;
	return drift.changes === undefined ? head : [head, ...drift.changes.map((change) => `  ${change}`)].join("\n");
};

export function formatCatalogDrifts(drifts) {
	return drifts.length === 0 ? "in sync" : drifts.map((drift) => formatDrift(drift)).join("\n");
}

const expandedId = (value) => (typeof value === "string" ? value : value?.id);

function defaultPriceChange(config, stripeProduct, byLookupKey) {
	const defaultDef = config.prices.find((price) => price.isDefault);
	const expected = defaultDef ? byLookupKey.get(defaultDef.lookupKey) : undefined;
	if (expected === undefined) {
		return [];
	}
	const current = expandedId(stripeProduct.default_price);
	return current === expected.id ? [] : [describeValue("default_price", current ?? null, expected.id)];
}

function expectedPriceDrifts(config, byLookupKey) {
	const drifts = [];
	for (const priceConfig of config.prices) {
		const stripePrice = byLookupKey.get(priceConfig.lookupKey);
		if (!stripePrice?.active) {
			drifts.push({ kind: "missing_price", lookupKey: priceConfig.lookupKey });
			continue;
		}
		const changes = priceMismatchChanges(priceConfig, stripePrice);
		if (changes.length === 0) {
			continue;
		}
		drifts.push({ kind: "mismatched_price", lookupKey: priceConfig.lookupKey, changes });
	}
	return drifts;
}

function extraPriceDrifts(stripePrices, priceLookupKeys) {
	return stripePrices.filter((price) => price.active && !priceLookupKeys.has(price.lookup_key ?? "")).map((price) => ({ kind: "extra_price", lookupKey: price.lookup_key ?? price.id }));
}

async function productDrifts(stripe, config, priceLookupKeys) {
	const stripeProduct = await findProductByLookupKey(stripe, config.lookupKey);
	if (!stripeProduct?.active) {
		return [{ kind: "missing_product", lookupKey: config.lookupKey, changes: config.prices.map((price) => `missing price ${price.lookupKey}`) }];
	}
	const stripePrices = await listPricesForProduct(stripe, stripeProduct.id);
	const byLookupKey = new Map(stripePrices.map((price) => [price.lookup_key, price]));
	const productChanges = [...productMismatchChanges(config, stripeProduct), ...defaultPriceChange(config, stripeProduct, byLookupKey)];
	const productDrift = productChanges.length > 0 ? [{ kind: "mismatched_product", lookupKey: config.lookupKey, changes: productChanges }] : [];
	return [...productDrift, ...expectedPriceDrifts(config, byLookupKey), ...extraPriceDrifts(stripePrices, priceLookupKeys)];
}

async function extraProductDrifts(stripe, productLookupKeys) {
	const all = await listAllProducts(stripe);
	return all
		.filter((product) => product.active && product.metadata?.lookup_key !== undefined && !productLookupKeys.has(product.metadata.lookup_key))
		.map((product) => ({ kind: "extra_product", lookupKey: product.metadata.lookup_key }));
}

export async function diffCatalog(stripe, products) {
	const drifts = [];
	const productLookupKeys = new Set(products.map((product) => product.lookupKey));
	const priceLookupKeys = new Set(products.flatMap((product) => product.prices.map((price) => price.lookupKey)));
	for (const config of products) {
		drifts.push(...(await productDrifts(stripe, config, priceLookupKeys)));
	}
	drifts.push(...(await extraProductDrifts(stripe, productLookupKeys)));
	return drifts;
}
