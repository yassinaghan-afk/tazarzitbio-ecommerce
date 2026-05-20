export interface ShippingSettings {
  defaultShippingPrice: number;
  freeShippingMinimumAmount: number;
  freeShippingMinimumProducts: number;
}

export const DEFAULT_SHIPPING_SETTINGS: ShippingSettings = {
  defaultShippingPrice: 40,
  freeShippingMinimumAmount: 399,
  freeShippingMinimumProducts: 3,
};
