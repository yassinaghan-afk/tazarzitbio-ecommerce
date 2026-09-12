/** Storefront + server: every upsell offer is 20% off catalog sale price. */
export const UPSELL_DISCOUNT_PERCENT = 20;

export function applyUpsellDiscount(listPrice: number): number {
  if (!Number.isFinite(listPrice) || listPrice <= 0) return 0;
  return Math.round(listPrice * (1 - UPSELL_DISCOUNT_PERCENT / 100));
}
