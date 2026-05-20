import type { PricingInput } from "./pricing";

export const PRICING_OVERRIDES_KEY = "tazarzit-pricing-overrides";

/** variantId -> partial pricing override */
export type PricingOverrides = Record<
  string,
  Partial<PricingInput> & { estimatedDeliveryCost?: number; estimatedAdsCost?: number }
>;

export function loadPricingOverrides(): PricingOverrides {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(PRICING_OVERRIDES_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as PricingOverrides;
  } catch {
    return {};
  }
}

export function savePricingOverrides(overrides: PricingOverrides): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(PRICING_OVERRIDES_KEY, JSON.stringify(overrides));
  window.dispatchEvent(new Event("tazarzit-pricing-updated"));
}

export function resetPricingOverrides(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(PRICING_OVERRIDES_KEY);
  window.dispatchEvent(new Event("tazarzit-pricing-updated"));
}
