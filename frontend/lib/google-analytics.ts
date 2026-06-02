import { TRACKING_CURRENCY } from "@/lib/tracking/types";
import { getActiveTrackingSettings, isTrackingPlatformActive } from "@/lib/tracking/runtime";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

let initialized = false;

function getMeasurementId(): string {
  if (!isTrackingPlatformActive("googleAnalytics")) return "";
  return getActiveTrackingSettings().googleAnalytics.id;
}

function gtag(...args: unknown[]): void {
  if (typeof window === "undefined" || !window.gtag) return;
  window.gtag(...args);
}

export function initGoogleAnalytics(measurementId?: string): void {
  const id = measurementId ?? getMeasurementId();
  if (!id || initialized) return;
  gtag("js", new Date());
  gtag("config", id, { send_page_view: false });
  initialized = true;
}

export function pageview(url?: string): void {
  const id = getMeasurementId();
  if (!id) return;
  gtag("event", "page_view", {
    page_location: url ?? (typeof window !== "undefined" ? window.location.href : undefined),
    send_to: id,
  });
}

export function trackViewContent(params: {
  productId: string;
  slug: string;
  name: string;
  price: number;
  quantity?: number;
}): void {
  if (!getMeasurementId()) return;
  gtag("event", "view_item", {
    currency: TRACKING_CURRENCY,
    value: params.price * (params.quantity ?? 1),
    items: [
      {
        item_id: params.productId,
        item_name: params.name,
        item_category: "product",
        price: params.price,
        quantity: params.quantity ?? 1,
      },
    ],
  });
}

export function trackAddToCart(params: {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}): void {
  if (!getMeasurementId()) return;
  gtag("event", "add_to_cart", {
    currency: TRACKING_CURRENCY,
    value: params.price * params.quantity,
    items: [
      {
        item_id: params.productId,
        item_name: params.name,
        price: params.price,
        quantity: params.quantity,
      },
    ],
  });
}

export function trackInitiateCheckout(params: {
  products: { productId: string; name: string; price: number; quantity: number }[];
  subtotal: number;
  total: number;
}): void {
  if (!getMeasurementId()) return;
  gtag("event", "begin_checkout", {
    currency: TRACKING_CURRENCY,
    value: params.total,
    items: params.products.map((p) => ({
      item_id: p.productId,
      item_name: p.name,
      price: p.price,
      quantity: p.quantity,
    })),
  });
}

export function trackPurchase(params: {
  orderId: string;
  products: { productId: string; name: string; price: number; quantity: number }[];
  subtotal: number;
  total: number;
}): void {
  if (!getMeasurementId()) return;
  gtag("event", "purchase", {
    transaction_id: params.orderId,
    currency: TRACKING_CURRENCY,
    value: params.total,
    items: params.products.map((p) => ({
      item_id: p.productId,
      item_name: p.name,
      price: p.price,
      quantity: p.quantity,
    })),
  });
}

/** GA4 gtag bootstrap — dataLayer must exist before gtag.js loads. */
export const GA4_BOOTSTRAP = `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
window.gtag = gtag;
`;

export function ga4ScriptSrc(measurementId: string): string {
  return `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
}
