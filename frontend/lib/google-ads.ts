import { TRACKING_CURRENCY } from "@/lib/tracking/types";
import type { TrackingProduct } from "@/lib/tracking/types";
import {
  getActiveTrackingSettings,
  isTrackingPlatformActive,
} from "@/lib/tracking/runtime";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

let initialized = false;

function getAdsId(): string {
  if (!isTrackingPlatformActive("googleAds")) return "";
  return getActiveTrackingSettings().googleAds.id;
}

function getConversionLabel(): string {
  const fromSettings =
    getActiveTrackingSettings().googleAds.conversionLabel?.trim() || "";
  const fromEnv = process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL?.trim() || "";
  return fromSettings || fromEnv;
}

function gtag(...args: unknown[]): void {
  if (typeof window === "undefined" || !window.gtag) return;
  window.gtag(...args);
}

/** Ensure dataLayer + gtag stub exist before gtag.js loads. */
export const GOOGLE_ADS_BOOTSTRAP = `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
window.gtag = gtag;
`;

export function googleAdsScriptSrc(adsId: string): string {
  return `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(adsId)}`;
}

export function initGoogleAds(adsId?: string): void {
  const id = adsId ?? getAdsId();
  if (!id || initialized) return;
  gtag("js", new Date());
  gtag("config", id, {
    conversion_linker: true,
    allow_enhanced_conversions: true,
  });
  initialized = true;
}

/**
 * Fire Ads purchase measurement on thank-you.
 * - Always sends ecommerce `purchase` (detectable as a Google tag event in Ads).
 * - Also sends classic `conversion` when a Purchase conversion label is set.
 */
export function trackPurchase(params: {
  orderId: string;
  total: number;
  products?: TrackingProduct[];
}): void {
  const id = getAdsId();
  if (!id) return;

  const items = (params.products ?? []).map((p) => ({
    item_id: p.productId || p.slug,
    item_name: p.name,
    price: p.price,
    quantity: p.quantity,
  }));

  gtag("event", "purchase", {
    send_to: id,
    transaction_id: params.orderId,
    value: params.total,
    currency: TRACKING_CURRENCY,
    items,
  });

  const label = getConversionLabel();
  if (!label) return;

  gtag("event", "conversion", {
    send_to: `${id}/${label}`,
    value: params.total,
    currency: TRACKING_CURRENCY,
    transaction_id: params.orderId,
  });
}
