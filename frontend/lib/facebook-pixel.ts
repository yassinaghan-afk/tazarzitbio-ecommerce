import { TRACKING_CURRENCY } from "@/lib/tracking/types";
import { resolveMetaPixelId } from "@/lib/meta/pixel-id";
import { getActiveTrackingSettings, isTrackingPlatformActive } from "@/lib/tracking/runtime";

type FbqFn = {
  (...args: unknown[]): void;
  callMethod?: (...args: unknown[]) => void;
  queue?: unknown[][];
  loaded?: boolean;
  version?: string;
  push?: FbqFn;
};

declare global {
  interface Window {
    fbq?: FbqFn;
    _fbq?: FbqFn;
  }
}

/** Guard against double `fbq('init')`. */
let initialized = false;
/**
 * True after the official bootstrap snippet already fired the initial PageView.
 * The SPA PageView tracker skips the first Meta PageView so we don't double-count.
 */
let suppressNextPageView = false;

function getPixelId(): string {
  if (typeof window !== "undefined") {
    // Prefer runtime-resolved admin/env settings when available.
    if (isTrackingPlatformActive("facebook")) {
      const id = getActiveTrackingSettings().facebook.id;
      if (id) return resolveMetaPixelId(id);
    }
  }
  return resolveMetaPixelId();
}

function fbq(...args: unknown[]): void {
  if (typeof window === "undefined" || !window.fbq) return;
  window.fbq(...args);
}

/**
 * Official Meta Pixel bootstrap (equivalent to Meta's provided base code):
 * - loads fbevents.js once
 * - fbq('init', PIXEL_ID)
 * - fbq('track', 'PageView') for the first hit
 *
 * Pixel ID is injected safely as digits-only.
 */
export function buildMetaPixelBootstrap(pixelId: string): string {
  const id = resolveMetaPixelId(pixelId);
  return `
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${id}');
fbq('track', 'PageView');
`.trim();
}

/** @deprecated use buildMetaPixelBootstrap(pixelId) — kept for any old imports */
export const FACEBOOK_PIXEL_BOOTSTRAP = buildMetaPixelBootstrap(resolveMetaPixelId());

/**
 * Call when the official bootstrap (init + PageView) is about to mount so the
 * SPA PageView tracker skips only the first Meta PageView (no double count).
 */
export function primeMetaPixelBootstrap(): void {
  initialized = true;
  suppressNextPageView = true;
}

/** @deprecated use primeMetaPixelBootstrap */
export function acknowledgeMetaPixelBootstrap(): void {
  primeMetaPixelBootstrap();
}

export function initFacebookPixel(pixelId?: string): void {
  const id = resolveMetaPixelId(pixelId ?? getPixelId());
  if (!id || initialized) return;
  fbq("init", id);
  initialized = true;
}

export function pageview(): void {
  if (!getPixelId()) return;
  if (suppressNextPageView) {
    suppressNextPageView = false;
    return;
  }
  fbq("track", "PageView");
}

function withEventId(
  payload: Record<string, unknown>,
  eventId?: string,
): [Record<string, unknown>, { eventID: string }?] {
  if (!eventId) return [payload];
  return [payload, { eventID: eventId }];
}

export function trackViewContent(params: {
  productId: string;
  name: string;
  price: number;
  quantity?: number;
  eventId?: string;
}): void {
  if (!getPixelId()) return;
  const [data, opts] = withEventId(
    {
      content_ids: [params.productId],
      content_name: params.name,
      content_type: "product",
      value: params.price * (params.quantity ?? 1),
      currency: TRACKING_CURRENCY,
    },
    params.eventId,
  );
  if (opts) fbq("track", "ViewContent", data, opts);
  else fbq("track", "ViewContent", data);
}

export function trackAddToCart(params: {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  eventId?: string;
}): void {
  if (!getPixelId()) return;
  const [data, opts] = withEventId(
    {
      content_ids: [params.productId],
      content_name: params.name,
      content_type: "product",
      value: params.price * params.quantity,
      currency: TRACKING_CURRENCY,
      num_items: params.quantity,
    },
    params.eventId,
  );
  if (opts) fbq("track", "AddToCart", data, opts);
  else fbq("track", "AddToCart", data);
}

export function trackInitiateCheckout(params: {
  products: {
    productId: string;
    name?: string;
    price: number;
    quantity: number;
  }[];
  total: number;
  eventId?: string;
}): void {
  if (!getPixelId()) return;
  const contents = params.products.map((p) => ({
    id: p.productId,
    quantity: p.quantity,
    item_price: p.price,
  }));
  const [data, opts] = withEventId(
    {
      content_ids: params.products.map((p) => p.productId),
      contents,
      content_type: "product",
      value: params.total,
      currency: TRACKING_CURRENCY,
      num_items: params.products.reduce((sum, p) => sum + p.quantity, 0),
    },
    params.eventId,
  );
  if (opts) fbq("track", "InitiateCheckout", data, opts);
  else fbq("track", "InitiateCheckout", data);
}

export function trackPurchase(params: {
  orderId: string;
  products: { productId: string; name: string; price: number; quantity: number }[];
  total: number;
  eventId?: string;
}): void {
  if (!getPixelId()) return;
  const contents = params.products.map((p) => ({
    id: p.productId,
    quantity: p.quantity,
    item_price: p.price,
  }));
  const [data, opts] = withEventId(
    {
      content_ids: params.products.map((p) => p.productId),
      contents,
      content_name: params.products.map((p) => p.name).join(", "),
      content_type: "product",
      value: params.total,
      currency: TRACKING_CURRENCY,
      num_items: params.products.reduce((sum, p) => sum + p.quantity, 0),
      order_id: params.orderId,
    },
    params.eventId,
  );
  if (opts) fbq("track", "Purchase", data, opts);
  else fbq("track", "Purchase", data);
}

/** Noscript fallback image URL (Meta base code). */
export function metaPixelNoscriptSrc(pixelId?: string): string {
  const id = resolveMetaPixelId(pixelId);
  return `https://www.facebook.com/tr?id=${encodeURIComponent(id)}&ev=PageView&noscript=1`;
}
