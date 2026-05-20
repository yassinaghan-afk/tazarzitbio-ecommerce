import type { CartLineItem } from "@/lib/cart/types";
import { getProducts } from "@/lib/products/catalog";

import {
  DEFAULT_SHIPPING_SETTINGS,
  type ShippingSettings,
} from "./settings";

export type FreeShippingReason =
  | "bundle"
  | "minimum_amount"
  | "minimum_products";

export interface ShippingResult {
  /** Flat fee for the whole order (0 if free) */
  shippingFee: number;
  isFreeShipping: boolean;
  freeShippingReason?: FreeShippingReason;
  /** Total units in cart (sum of quantities) */
  productCount: number;
  subtotal: number;
  total: number;
  labelFr: string;
  labelAr: string;
  /** Shown when customer can unlock free shipping */
  upsellMessageFr?: string;
  upsellMessageAr?: string;
}

function cartHasBundle(items: CartLineItem[]): boolean {
  const catalog = getProducts();
  return items.some((item) => {
    if (item.isBundle) return true;
    const product = catalog.find(
      (p) => p.slug === item.slug || p.id === item.productId,
    );
    return product?.category === "bundles";
  });
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
  const hasBundle = cartHasBundle(items);

  if (items.length === 0) {
    return {
      shippingFee: 0,
      isFreeShipping: true,
      productCount: 0,
      subtotal: 0,
      total: 0,
      labelFr: "Livraison gratuite",
      labelAr: "توصيل مجاني",
    };
  }

  let freeShippingReason: FreeShippingReason | undefined;
  if (hasBundle) {
    freeShippingReason = "bundle";
  } else if (subtotal >= settings.freeShippingMinimumAmount) {
    freeShippingReason = "minimum_amount";
  } else if (productCount >= settings.freeShippingMinimumProducts) {
    freeShippingReason = "minimum_products";
  }

  const isFreeShipping = Boolean(freeShippingReason);
  const shippingFee = isFreeShipping ? 0 : settings.defaultShippingPrice;
  const total = subtotal + shippingFee;

  const labelFr = isFreeShipping
    ? "Livraison gratuite"
    : `Frais de livraison: ${settings.defaultShippingPrice} MAD`;

  const labelAr = isFreeShipping
    ? "توصيل مجاني"
    : `رسوم التوصيل: ${settings.defaultShippingPrice} د.م.`;

  const showUpsell =
    !isFreeShipping &&
    productCount < settings.freeShippingMinimumProducts &&
    subtotal < settings.freeShippingMinimumAmount;

  const productsNeeded = Math.max(
    0,
    settings.freeShippingMinimumProducts - productCount,
  );

  return {
    shippingFee,
    isFreeShipping,
    freeShippingReason,
    productCount,
    subtotal,
    total,
    labelFr,
    labelAr,
    upsellMessageFr: showUpsell
      ? "Ajoutez encore un produit pour bénéficier de la livraison gratuite 🚚"
      : undefined,
    upsellMessageAr: showUpsell
      ? productsNeeded === 1
        ? "أضف منتجاً آخر للاستفادة من التوصيل المجاني 🚚"
        : `أضف ${productsNeeded} منتجات للاستفادة من التوصيل المجاني 🚚`
      : undefined,
  };
}
