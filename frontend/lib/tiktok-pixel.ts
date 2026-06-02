import { TRACKING_CURRENCY } from "@/lib/tracking/types";
import { getActiveTrackingSettings, isTrackingPlatformActive } from "@/lib/tracking/runtime";

interface TikTokQueue {
  methods: string[];
  setAndDefer: (target: TikTokQueue, method: string) => void;
  instance: (id: string) => TikTokQueue;
  load: (id: string, options?: Record<string, unknown>) => void;
  page: () => void;
  track: (event: string, params?: Record<string, unknown>) => void;
  push: (args: unknown[]) => void;
}

declare global {
  interface Window {
    TiktokAnalyticsObject?: string;
    ttq?: TikTokQueue;
  }
}

let initialized = false;

function getPixelId(): string {
  if (!isTrackingPlatformActive("tiktok")) return "";
  return getActiveTrackingSettings().tiktok.id;
}

function ttq(): TikTokQueue | undefined {
  if (typeof window === "undefined") return undefined;
  return window.ttq;
}

export function initTikTokPixel(pixelId?: string): void {
  const id = pixelId ?? getPixelId();
  if (!id || initialized) return;
  const queue = ttq();
  if (!queue) return;
  queue.load(id);
  initialized = true;
}

export function pageview(): void {
  if (!getPixelId()) return;
  ttq()?.page();
}

export function trackViewContent(params: {
  productId: string;
  name: string;
  price: number;
  quantity?: number;
}): void {
  if (!getPixelId()) return;
  ttq()?.track("ViewContent", {
    content_id: params.productId,
    content_name: params.name,
    content_type: "product",
    price: params.price,
    quantity: params.quantity ?? 1,
    currency: TRACKING_CURRENCY,
    value: params.price * (params.quantity ?? 1),
  });
}

export function trackAddToCart(params: {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}): void {
  if (!getPixelId()) return;
  ttq()?.track("AddToCart", {
    content_id: params.productId,
    content_name: params.name,
    content_type: "product",
    price: params.price,
    quantity: params.quantity,
    currency: TRACKING_CURRENCY,
    value: params.price * params.quantity,
  });
}

export function trackInitiateCheckout(params: {
  products: { productId: string; name: string; price: number; quantity: number }[];
  total: number;
}): void {
  if (!getPixelId()) return;
  ttq()?.track("InitiateCheckout", {
    contents: params.products.map((p) => ({
      content_id: p.productId,
      content_name: p.name,
      price: p.price,
      quantity: p.quantity,
    })),
    value: params.total,
    currency: TRACKING_CURRENCY,
  });
}

export function trackPurchase(params: {
  orderId: string;
  products: { productId: string; name: string; price: number; quantity: number }[];
  total: number;
}): void {
  if (!getPixelId()) return;
  ttq()?.track("CompletePayment", {
    contents: params.products.map((p) => ({
      content_id: p.productId,
      content_name: p.name,
      price: p.price,
      quantity: p.quantity,
    })),
    value: params.total,
    currency: TRACKING_CURRENCY,
    order_id: params.orderId,
  });
}

/** TikTok Pixel bootstrap — injected once via next/script. */
export const TIKTOK_PIXEL_BOOTSTRAP = `
!function (w, d, t) {
  w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};n=document.createElement("script");n.type="text/javascript",n.async=!0,n.src=r+"?sdkid="+e+"&lib="+t;e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(n,e)};
}(window, document, 'ttq');
`;
