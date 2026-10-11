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

export const PRODUCTS: StripeProductDefinition[] = [];
