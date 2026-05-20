export interface ShippingSettings {
  defaultShippingPrice: number;
  freeShippingMinimumAmount: number;
  /** @deprecated No longer used for free shipping — kept for admin/storage compat */
  freeShippingMinimumProducts: number;
}

/** Single source of truth for free shipping threshold (MAD) */
export const FREE_SHIPPING_THRESHOLD_MAD = 349;

export const FREE_SHIPPING_MARKETING_AR =
  "توصيل مجاني للطلبات فوق 349 درهم";

export const DEFAULT_SHIPPING_SETTINGS: ShippingSettings = {
  defaultShippingPrice: 40,
  freeShippingMinimumAmount: FREE_SHIPPING_THRESHOLD_MAD,
  freeShippingMinimumProducts: 3,
};
