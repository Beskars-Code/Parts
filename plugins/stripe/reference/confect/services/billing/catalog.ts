import type { PlanId } from "./planentitlements";

export const FORECASTER_PRODUCT_LOOKUP_KEY = "forecaster_plan";
export const SUPERFORECASTER_PRODUCT_LOOKUP_KEY = "superforecaster_plan";
const FORECASTER_PRICE_LOOKUP_KEY = "forecaster_plan_monthly";
const SUPERFORECASTER_PRICE_LOOKUP_KEY = "superforecaster_plan_monthly";
const TAX_CODE = "txcd_10105001";

interface StripePriceDefinition {
	amount: number;
	currency: string;
	interval: string;
	lookupKey: string;
	nickname: string;
	isDefault: boolean;
	usageType: "licensed";
	billingScheme: "per_unit";
}

interface StripeProductDefinition {
	name: string;
	description: string;
	lookupKey: string;
	taxCode: string;
	prices: StripePriceDefinition[];
}

export const PRODUCTS: StripeProductDefinition[] = [
	{
		name: "Forecaster",
		description: "Open the Agora, run analyses on markets you choose, API and webhooks.",
		lookupKey: FORECASTER_PRODUCT_LOOKUP_KEY,
		taxCode: TAX_CODE,
		prices: [
			{
				amount: 3900,
				currency: "usd",
				interval: "month",
				lookupKey: FORECASTER_PRICE_LOOKUP_KEY,
				nickname: "Monthly",
				isDefault: true,
				usageType: "licensed",
				billingScheme: "per_unit",
			},
		],
	},
	{
		name: "Superforecaster",
		description: "Everything in Forecaster, with higher Insight and Tracker allowances and overage authorization.",
		lookupKey: SUPERFORECASTER_PRODUCT_LOOKUP_KEY,
		taxCode: TAX_CODE,
		prices: [
			{
				amount: 9900,
				currency: "usd",
				interval: "month",
				lookupKey: SUPERFORECASTER_PRICE_LOOKUP_KEY,
				nickname: "Monthly",
				isDefault: true,
				usageType: "licensed",
				billingScheme: "per_unit",
			},
		],
	},
];

const LOOKUP_TO_PLAN: Readonly<Record<string, PlanId>> = {
	[FORECASTER_PRODUCT_LOOKUP_KEY]: "forecaster",
	[SUPERFORECASTER_PRODUCT_LOOKUP_KEY]: "superforecaster",
};

export function planFromLookupKey(lookupKey: string | undefined): PlanId | undefined {
	return lookupKey === undefined ? undefined : LOOKUP_TO_PLAN[lookupKey];
}
