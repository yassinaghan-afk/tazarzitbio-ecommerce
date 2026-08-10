export interface ShippingSettings {
  defaultShippingPrice: number;
  freeShippingMinimumAmount: number;
  freeShippingMinimumProducts: number;
  /** free shipping when subtotal >= freeShippingMinimumAmount */
  freeShippingByAmountEnabled: boolean;
  /** free shipping when cart has >= freeShippingMinimumProducts items */
  freeShippingByQuantityEnabled: boolean;
  /** free shipping when the cart contains a bundle/pack item */
  bundleFreeShippingEnabled: boolean;
}

/** Default free shipping threshold (MAD) — editable in Admin → Shipping */
export const FREE_SHIPPING_THRESHOLD_MAD = 349;

export const FREE_SHIPPING_MARKETING_AR =
  "توصيل مجاني للطلبات فوق 349 درهم";

export const DEFAULT_SHIPPING_SETTINGS: ShippingSettings = {
  defaultShippingPrice: 40,
  freeShippingMinimumAmount: FREE_SHIPPING_THRESHOLD_MAD,
  freeShippingMinimumProducts: 3,
  freeShippingByAmountEnabled: true,
  freeShippingByQuantityEnabled: false,
  bundleFreeShippingEnabled: false,
};
