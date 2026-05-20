import {
  DEFAULT_SHIPPING_SETTINGS,
  type ShippingSettings,
} from "./settings";

export const SHIPPING_SETTINGS_KEY = "tazarzit-shipping-settings";

export function loadShippingSettings(): ShippingSettings {
  if (typeof window === "undefined") return DEFAULT_SHIPPING_SETTINGS;
  try {
    const raw = localStorage.getItem(SHIPPING_SETTINGS_KEY);
    if (!raw) return DEFAULT_SHIPPING_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<ShippingSettings>;
    return {
      defaultShippingPrice:
        parsed.defaultShippingPrice ??
        DEFAULT_SHIPPING_SETTINGS.defaultShippingPrice,
      freeShippingMinimumAmount:
        parsed.freeShippingMinimumAmount ??
        DEFAULT_SHIPPING_SETTINGS.freeShippingMinimumAmount,
      freeShippingMinimumProducts:
        parsed.freeShippingMinimumProducts ??
        DEFAULT_SHIPPING_SETTINGS.freeShippingMinimumProducts,
    };
  } catch {
    return DEFAULT_SHIPPING_SETTINGS;
  }
}

export function saveShippingSettings(settings: ShippingSettings): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(SHIPPING_SETTINGS_KEY, JSON.stringify(settings));
  window.dispatchEvent(new Event("tazarzit-shipping-updated"));
}

export function resetShippingSettings(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SHIPPING_SETTINGS_KEY);
  window.dispatchEvent(new Event("tazarzit-shipping-updated"));
}
