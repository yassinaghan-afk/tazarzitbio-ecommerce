import { TRACKING_CURRENCY } from "@/lib/tracking/types";
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
  return process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL?.trim() || "";
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
  gtag("config", id, { conversion_linker: true });
  initialized = true;
}

/**
 * Fire Ads conversion on thank-you when a conversion label is configured.
 * Base AW- config still loads sitewide without a label (remarketing + linker).
 */
export function trackPurchase(params: {
  orderId: string;
  total: number;
}): void {
  const id = getAdsId();
  if (!id) return;

  const label = getConversionLabel();
  if (!label) return;

  gtag("event", "conversion", {
    send_to: `${id}/${label}`,
    value: params.total,
    currency: TRACKING_CURRENCY,
    transaction_id: params.orderId,
  });
}
