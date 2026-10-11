// Syncs the project's code-owned catalog to Stripe, then mirrors it into Convex.
// Ported from Apollo-Labs lib/stripe/setup.ts minus meters, tiers, credits, and cleanup-by-delete.
import {
	PRODUCTS,
	diffCatalog,
	findPriceByLookupKey,
	findProductByLookupKey,
	formatCatalogDrifts,
	listAllProducts,
	listPricesForProduct,
	priceImmutableChanges,
	priceMismatchChanges,
	productMismatchChanges,
} from "./catalog-diff.mjs";
import { convexRun, createStripeClient, requireStripeSecretKey } from "./environment.mjs";

const ctx = { stripe: undefined, writes: { stripe: 0, convex: 0 } };

function priceCreateParams(productId, config) {
	return {
		product: productId,
		currency: config.currency,
		unit_amount: config.amount,
		nickname: config.nickname,
		lookup_key: config.lookupKey,
		transfer_lookup_key: true,
		tax_behavior: "exclusive",
		recurring: { interval: config.interval, usage_type: config.usageType ?? "licensed" },
	};
}

// --- Stripe converge (write mode) ---

async function createProduct(config) {
	const created = await ctx.stripe.products.create({
		name: config.name,
		description: config.description,
		tax_code: config.taxCode,
		metadata: { lookup_key: config.lookupKey },
	});
	ctx.writes.stripe += 1;
	console.log(`  created product ${created.id} (${config.lookupKey})`);
	return created;
}

async function updateProduct(stripeProduct, config) {
	const updated = await ctx.stripe.products.update(stripeProduct.id, {
		name: config.name,
		description: config.description,
		tax_code: config.taxCode,
		metadata: { lookup_key: config.lookupKey },
	});
	ctx.writes.stripe += 1;
	console.log(`  updated product ${updated.id}`);
	return updated;
}

async function convergeProduct(config) {
	const stripeProduct = await findProductByLookupKey(ctx.stripe, config.lookupKey);
	if (!stripeProduct?.active) {
		return createProduct(config);
	}
	if (productMismatchChanges(config, stripeProduct).length === 0) {
		console.log(`  product ${config.lookupKey} up to date`);
		return stripeProduct;
	}
	return updateProduct(stripeProduct, config);
}

async function createPrice(stripeProduct, config) {
	const created = await ctx.stripe.prices.create(priceCreateParams(stripeProduct.id, config));
	ctx.writes.stripe += 1;
	console.log(`  created price ${created.id} (${config.lookupKey})`);
	return created;
}

async function replacePrice(stripeProduct, existing, config) {
	const created = await createPrice(stripeProduct, config);
	await ctx.stripe.prices.update(existing.id, { active: false, lookup_key: "" });
	ctx.writes.stripe += 1;
	console.log(`  replaced price ${existing.id} -> ${created.id} (${config.lookupKey})`);
	return created;
}

async function convergePrice(stripeProduct, config) {
	const existing = await findPriceByLookupKey(ctx.stripe, config.lookupKey);
	if (!existing?.active) {
		return createPrice(stripeProduct, config);
	}
	if (priceImmutableChanges(config, existing).length > 0) {
		return replacePrice(stripeProduct, existing, config);
	}
	if (priceMismatchChanges(config, existing).length === 0) {
		console.log(`  price ${config.lookupKey} up to date`);
		return existing;
	}
	await ctx.stripe.prices.update(existing.id, { nickname: config.nickname });
	ctx.writes.stripe += 1;
	console.log(`  updated price ${existing.id} nickname (${config.lookupKey})`);
	return existing;
}

async function archiveExtraPrice(price, lookupKey) {
	await ctx.stripe.prices.update(price.id, { active: false, lookup_key: "" });
	ctx.writes.stripe += 1;
	console.log(`  archived extra price ${price.id} on ${lookupKey}`);
}

async function convergeProductExtras(stripeProduct, config) {
	const wanted = new Set(config.prices.map((price) => price.lookupKey));
	const stripePrices = await listPricesForProduct(ctx.stripe, stripeProduct.id);
	const extras = stripePrices.filter((price) => price.active && !wanted.has(price.lookup_key ?? ""));
	for (const price of extras) {
		await archiveExtraPrice(price, config.lookupKey);
	}
}

async function ensureDefaultPrice(stripeProduct, defaultPriceId) {
	const current = typeof stripeProduct.default_price === "string" ? stripeProduct.default_price : stripeProduct.default_price?.id;
	if (defaultPriceId === undefined || current === defaultPriceId) {
		return;
	}
	await ctx.stripe.products.update(stripeProduct.id, { default_price: defaultPriceId });
	ctx.writes.stripe += 1;
	console.log(`  set default price ${defaultPriceId} on ${stripeProduct.id}`);
}

// --- Convex mirror ---

async function convexProductForStripe(stripeProduct, config, defaultStripePriceId) {
	const id = await convexRun("stripe/products:upsert", {
		stripeProductId: stripeProduct.id,
		name: stripeProduct.name,
		description: stripeProduct.description ?? "",
		lookupKey: config.lookupKey,
		status: stripeProduct.active ? "active" : "archived",
		defaultStripePriceId,
	});
	ctx.writes.convex += 1;
	return id;
}

const priceAmount = (price) => price.unit_amount ?? 0;
const priceInterval = (price) => price.recurring?.interval ?? "";
const priceNickname = (price) => price.nickname ?? "";
const stripeStatus = (active) => (active ? "active" : "archived");

function convexPriceArgs(stripePrice, convexProductId, isDefault) {
	return {
		stripePriceId: stripePrice.id,
		productId: convexProductId,
		amount: priceAmount(stripePrice),
		currency: stripePrice.currency,
		interval: priceInterval(stripePrice),
		nickname: priceNickname(stripePrice),
		isDefault,
		status: stripeStatus(stripePrice.active),
	};
}

async function convexPriceForStripe(stripePrice, convexProductId, isDefault) {
	await convexRun("stripe/prices:upsert", convexPriceArgs(stripePrice, convexProductId, isDefault));
	ctx.writes.convex += 1;
}

async function archiveConvexProduct(stripeId) {
	await convexRun("stripe/products:archiveByStripeId", { stripeProductId: stripeId });
	ctx.writes.convex += 1;
	console.log(`  archived Convex product ${stripeId} (inactive in Stripe)`);
}

async function archiveConvexPrice(stripeId) {
	await convexRun("stripe/prices:archiveByStripeId", { stripePriceId: stripeId });
	ctx.writes.convex += 1;
	console.log(`  archived Convex price ${stripeId} (inactive in Stripe)`);
}

async function isStripePriceActive(stripeId) {
	try {
		const price = await ctx.stripe.prices.retrieve(stripeId);
		return price.active === true;
	} catch (error) {
		if (error?.statusCode === 404) {
			return false;
		}
		throw error;
	}
}

async function archiveConvexOrphans() {
	const products = await listAllProducts(ctx.stripe);
	const activeProductIds = new Set(products.filter((product) => product.active).map((product) => product.id));
	const convexProductIds = await convexRun("stripe/products:listActiveStripeIds");
	const staleProducts = convexProductIds.filter((stripeId) => !activeProductIds.has(stripeId));
	for (const stripeId of staleProducts) {
		await archiveConvexProduct(stripeId);
	}
	const convexPriceIds = await convexRun("stripe/prices:listActiveStripeIds");
	for (const stripeId of convexPriceIds) {
		if (await isStripePriceActive(stripeId)) {
			continue;
		}
		await archiveConvexPrice(stripeId);
	}
}

// --- Check-mode Convex drift ---

async function productMirrorDrifts(config, stripeProduct) {
	const convexProduct = await convexRun("stripe/products:getByLookupKey", { lookupKey: config.lookupKey });
	if (convexProduct === null) {
		return [`missing_in_convex: ${config.lookupKey}`];
	}
	return convexProduct.stripeProductId === stripeProduct.id && convexProduct.status === "active" ? [] : [`mismatched_in_convex: ${config.lookupKey} product mirror out of date`];
}

function priceMirrorMismatch(convexPrice, stripePrice, priceConfig) {
	const isInSync = convexPrice.amount === stripePrice.unit_amount && convexPrice.isDefault === priceConfig.isDefault && convexPrice.status === "active";
	return isInSync ? [] : [`mismatched_in_convex: price ${priceConfig.lookupKey} (${stripePrice.id})`];
}

async function priceMirrorDrift(priceConfig) {
	const stripePrice = await findPriceByLookupKey(ctx.stripe, priceConfig.lookupKey);
	if (!stripePrice?.active) {
		return [];
	}
	const convexPrice = await convexRun("stripe/prices:getByStripeId", { stripePriceId: stripePrice.id });
	return convexPrice === null ? [`missing_in_convex: price ${priceConfig.lookupKey} (${stripePrice.id})`] : priceMirrorMismatch(convexPrice, stripePrice, priceConfig);
}

async function mirrorDriftsForProduct(config) {
	const stripeProduct = await findProductByLookupKey(ctx.stripe, config.lookupKey);
	if (!stripeProduct?.active) {
		return [];
	}
	const drifts = await productMirrorDrifts(config, stripeProduct);
	for (const priceConfig of config.prices) {
		drifts.push(...(await priceMirrorDrift(priceConfig)));
	}
	return drifts;
}

async function staleMirrorDrifts() {
	const products = await listAllProducts(ctx.stripe);
	const activeProductIds = new Set(products.filter((product) => product.active).map((product) => product.id));
	const convexProductIds = await convexRun("stripe/products:listActiveStripeIds");
	const drifts = convexProductIds.filter((stripeId) => !activeProductIds.has(stripeId)).map((stripeId) => `stale_in_convex: product ${stripeId} not active in Stripe`);
	const convexPriceIds = await convexRun("stripe/prices:listActiveStripeIds");
	for (const stripeId of convexPriceIds) {
		if (await isStripePriceActive(stripeId)) {
			continue;
		}
		drifts.push(`stale_in_convex: price ${stripeId} not active in Stripe`);
	}
	return drifts;
}

async function convexMirrorDrifts() {
	const drifts = [];
	for (const config of PRODUCTS) {
		drifts.push(...(await mirrorDriftsForProduct(config)));
	}
	drifts.push(...(await staleMirrorDrifts()));
	return drifts;
}

// --- Entry ---

async function convergeOneProduct(config) {
	console.log(`Product ${config.name} (${config.lookupKey})`);
	const stripeProduct = await convergeProduct(config);
	const convergedPrices = [];
	for (const priceConfig of config.prices) {
		convergedPrices.push({ config: priceConfig, stripePrice: await convergePrice(stripeProduct, priceConfig) });
	}
	await convergeProductExtras(stripeProduct, config);
	const defaultPriceId = convergedPrices.find((entry) => entry.config.isDefault)?.stripePrice.id;
	await ensureDefaultPrice(stripeProduct, defaultPriceId);
	const convexProductId = await convexProductForStripe(stripeProduct, config, defaultPriceId);
	for (const entry of convergedPrices) {
		await convexPriceForStripe(entry.stripePrice, convexProductId, entry.config.isDefault);
	}
}

async function applySetup() {
	for (const config of PRODUCTS) {
		await convergeOneProduct(config);
	}
	await archiveConvexOrphans();
	console.log(`Stripe writes: ${ctx.writes.stripe}`);
	console.log(`Convex writes: ${ctx.writes.convex}`);
}

async function runCheck() {
	const drifts = await diffCatalog(ctx.stripe, PRODUCTS);
	const convexDrifts = await convexMirrorDrifts();
	const lines = [formatCatalogDrifts(drifts), ...convexDrifts].filter((line) => line !== "");
	console.log(lines.join("\n"));
	if (drifts.length === 0 && convexDrifts.length === 0) {
		return;
	}
	process.exitCode = 1;
}

async function run() {
	if (PRODUCTS.length === 0) {
		throw new Error("Define this project's code-owned Stripe catalog before running setup or check.");
	}
	const flags = new Set(process.argv.slice(2));
	ctx.stripe = createStripeClient(requireStripeSecretKey({ allowLive: flags.has("--allow-live") }));
	if (flags.has("--check")) {
		await runCheck();
		return;
	}
	await applySetup();
}

try {
	await run();
} catch (error) {
	console.error(Error.isError(error) ? error.message : String(error));
	process.exitCode = 1;
}
