/** Internal economics — never render on public storefront */

export const DEFAULT_DELIVERY_COST = 30;
export const DEFAULT_ADS_COST = 20;

export interface PricingEconomics {
  costPrice: number;
  salePrice: number;
  grossProfit: number;
  estimatedDeliveryCost: number;
  estimatedAdsCost: number;
  estimatedNetProfit: number;
  profitMarginPercent: number;
}

export interface PricingInput {
  costPrice: number;
  salePrice: number;
  estimatedDeliveryCost?: number;
  estimatedAdsCost?: number;
}

export function buildPricingEconomics(input: PricingInput): PricingEconomics {
  const estimatedDeliveryCost = input.estimatedDeliveryCost ?? DEFAULT_DELIVERY_COST;
  const estimatedAdsCost = input.estimatedAdsCost ?? DEFAULT_ADS_COST;
  const grossProfit = round2(input.salePrice - input.costPrice);
  const estimatedNetProfit = round2(
    input.salePrice - input.costPrice - estimatedDeliveryCost - estimatedAdsCost,
  );
  const profitMarginPercent = round2(
    input.salePrice > 0 ? (estimatedNetProfit / input.salePrice) * 100 : 0,
  );

  return {
    costPrice: input.costPrice,
    salePrice: input.salePrice,
    grossProfit,
    estimatedDeliveryCost,
    estimatedAdsCost,
    estimatedNetProfit,
    profitMarginPercent,
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
