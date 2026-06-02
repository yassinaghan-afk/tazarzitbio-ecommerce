import { TRACKING_CURRENCY } from "@/lib/tracking/types";
import { getActiveTrackingSettings, isTrackingPlatformActive } from "@/lib/tracking/runtime";

type SnapTrFn = (command: string, ...args: unknown[]) => void;

declare global {
  interface Window {
    snaptr?: SnapTrFn;
  }
}

let initialized = false;

function getPixelId(): string {
  if (!isTrackingPlatformActive("snapchat")) return "";
  return getActiveTrackingSettings().snapchat.id;
}

function snaptr(command: string, ...args: unknown[]): void {
  if (typeof window === "undefined" || !window.snaptr) return;
  window.snaptr(command, ...args);
}

export function initSnapchatPixel(pixelId?: string): void {
  const id = pixelId ?? getPixelId();
  if (!id || initialized) return;
  snaptr("init", id, {});
  initialized = true;
}

export function pageview(): void {
  if (!getPixelId()) return;
  snaptr("track", "PAGE_VIEW");
}

export function trackViewContent(params: {
  productId: string;
  name: string;
  price: number;
  quantity?: number;
}): void {
  if (!getPixelId()) return;
  snaptr("track", "VIEW_CONTENT", {
    item_ids: [params.productId],
    item_category: "product",
    description: params.name,
    price: params.price,
    currency: TRACKING_CURRENCY,
    number_items: params.quantity ?? 1,
  });
}

export function trackAddToCart(params: {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}): void {
  if (!getPixelId()) return;
  snaptr("track", "ADD_CART", {
    item_ids: [params.productId],
    description: params.name,
    price: params.price,
    currency: TRACKING_CURRENCY,
    number_items: params.quantity,
  });
}

export function trackInitiateCheckout(params: {
  products: { productId: string; price: number; quantity: number }[];
  total: number;
}): void {
  if (!getPixelId()) return;
  snaptr("track", "START_CHECKOUT", {
    item_ids: params.products.map((p) => p.productId),
    price: params.total,
    currency: TRACKING_CURRENCY,
    number_items: params.products.reduce((sum, p) => sum + p.quantity, 0),
  });
}

export function trackPurchase(params: {
  orderId: string;
  products: { productId: string; price: number; quantity: number }[];
  total: number;
}): void {
  if (!getPixelId()) return;
  snaptr("track", "PURCHASE", {
    item_ids: params.products.map((p) => p.productId),
    price: params.total,
    currency: TRACKING_CURRENCY,
    transaction_id: params.orderId,
    number_items: params.products.reduce((sum, p) => sum + p.quantity, 0),
  });
}

/** Snapchat Pixel bootstrap — injected once via next/script. */
export const SNAPCHAT_PIXEL_BOOTSTRAP = `
(function(e,t,n){if(e.snaptr)return;var a=e.snaptr=function()
{a.handleRequest?a.handleRequest.apply(a,arguments):a.queue.push(arguments)};
a.queue=[];var s='script';var r=t.createElement(s);r.async=!0;
r.src=n;var u=t.getElementsByTagName(s)[0];
u.parentNode.insertBefore(r,u);})(window,document,
'https://sc-static.net/scevent.min.js');
`;
