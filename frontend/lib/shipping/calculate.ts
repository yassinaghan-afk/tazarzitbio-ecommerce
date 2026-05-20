import type { CartLineItem } from "@/lib/cart/types";

import {
  DEFAULT_SHIPPING_SETTINGS,
  FREE_SHIPPING_MARKETING_AR,
  type ShippingSettings,
} from "./settings";

export type FreeShippingReason = "minimum_amount";

export interface ShippingResult {
  shippingFee: number;
  isFreeShipping: boolean;
  freeShippingReason?: FreeShippingReason;
  productCount: number;
  subtotal: number;
  total: number;
  labelFr: string;
  labelAr: string;
  freeShippingThreshold: number;
  /** MAD still needed for free shipping (0 if already free) */
  amountRemaining: number;
  /** 0–100 progress toward free shipping threshold */
  progressPercent: number;
  upsellMessageFr?: string;
  upsellMessageAr?: string;
}

function countProducts(items: CartLineItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

export function calculateShipping(
  items: CartLineItem[],
  subtotal: number,
  settings: ShippingSettings = DEFAULT_SHIPPING_SETTINGS,
): ShippingResult {
  const productCount = countProducts(items);
  const threshold = settings.freeShippingMinimumAmount;

  if (items.length === 0) {
    return {
      shippingFee: 0,
      isFreeShipping: true,
      productCount: 0,
      subtotal: 0,
      total: 0,
      labelFr: "Livraison gratuite",
      labelAr: "توصيل مجاني",
      freeShippingThreshold: threshold,
      amountRemaining: 0,
      progressPercent: 0,
    };
  }

  const isFreeShipping = subtotal >= threshold;
  const freeShippingReason = isFreeShipping ? "minimum_amount" : undefined;
  const shippingFee = isFreeShipping ? 0 : settings.defaultShippingPrice;
  const total = subtotal + shippingFee;
  const amountRemaining = isFreeShipping
    ? 0
    : Math.max(0, threshold - subtotal);
  const progressPercent = isFreeShipping
    ? 100
    : Math.min(100, Math.round((subtotal / threshold) * 100));

  const labelFr = isFreeShipping
    ? "Livraison gratuite"
    : `Frais de livraison: ${settings.defaultShippingPrice} MAD`;

  const labelAr = isFreeShipping
    ? "توصيل مجاني"
    : `رسوم التوصيل: ${settings.defaultShippingPrice} د.م.`;

  const showUpsell = !isFreeShipping && amountRemaining > 0;

  return {
    shippingFee,
    isFreeShipping,
    freeShippingReason,
    productCount,
    subtotal,
    total,
    labelFr,
    labelAr,
    freeShippingThreshold: threshold,
    amountRemaining,
    progressPercent,
    upsellMessageFr: showUpsell
      ? `Plus que ${amountRemaining} MAD pour la livraison gratuite 🚚`
      : undefined,
    upsellMessageAr: showUpsell
      ? `باقي ${amountRemaining} د.م. للتوصيل المجاني 🚚`
      : undefined,
  };
}

export { FREE_SHIPPING_MARKETING_AR };
