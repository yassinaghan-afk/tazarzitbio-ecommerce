import { TRACKING_CURRENCY } from "@/lib/tracking/types";
import { getActiveTrackingSettings, isTrackingPlatformActive } from "@/lib/tracking/runtime";

type FbqFn = {
  (...args: unknown[]): void;
  callMethod?: (...args: unknown[]) => void;
  queue?: unknown[][];
  loaded?: boolean;
  version?: string;
  push?: FbqFn;
}

declare global {
  interface Window {
    fbq?: FbqFn;
    _fbq?: FbqFn;
  }
}

let initialized = false;

function getPixelId(): string {
  if (!isTrackingPlatformActive("facebook")) return "";
  return getActiveTrackingSettings().facebook.id;
}

function fbq(...args: unknown[]): void {
  if (typeof window === "undefined" || !window.fbq) return;
  window.fbq(...args);
}

export function initFacebookPixel(pixelId?: string): void {
  const id = pixelId ?? getPixelId();
  if (!id || initialized) return;
  fbq("init", id);
  initialized = true;
}

export function pageview(): void {
  if (!getPixelId()) return;
  fbq("track", "PageView");
}

export function trackViewContent(params: {
  productId: string;
  name: string;
  price: number;
  quantity?: number;
}): void {
  if (!getPixelId()) return;
  fbq("track", "ViewContent", {
    content_ids: [params.productId],
    content_name: params.name,
    content_type: "product",
    value: params.price * (params.quantity ?? 1),
    currency: TRACKING_CURRENCY,
  });
}

export function trackAddToCart(params: {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}): void {
  if (!getPixelId()) return;
  fbq("track", "AddToCart", {
    content_ids: [params.productId],
    content_name: params.name,
    content_type: "product",
    value: params.price * params.quantity,
    currency: TRACKING_CURRENCY,
    num_items: params.quantity,
  });
}

export function trackInitiateCheckout(params: {
  products: { productId: string; price: number; quantity: number }[];
  total: number;
}): void {
  if (!getPixelId()) return;
  fbq("track", "InitiateCheckout", {
    content_ids: params.products.map((p) => p.productId),
    value: params.total,
    currency: TRACKING_CURRENCY,
    num_items: params.products.reduce((sum, p) => sum + p.quantity, 0),
  });
}

export function trackPurchase(params: {
  orderId: string;
  products: { productId: string; name: string; price: number; quantity: number }[];
  total: number;
}): void {
  if (!getPixelId()) return;
  fbq("track", "Purchase", {
    content_ids: params.products.map((p) => p.productId),
    content_name: params.products.map((p) => p.name).join(", "),
    value: params.total,
    currency: TRACKING_CURRENCY,
    num_items: params.products.reduce((sum, p) => sum + p.quantity, 0),
    order_id: params.orderId,
  });
}

/** Meta Pixel bootstrap snippet — injected once via next/script. */
export const FACEBOOK_PIXEL_BOOTSTRAP = `
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
`;
