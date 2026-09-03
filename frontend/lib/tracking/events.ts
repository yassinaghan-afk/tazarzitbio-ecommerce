import * as facebookPixel from "@/lib/facebook-pixel";
import * as openaiPixel from "@/lib/openai-pixel";
import * as tiktokPixel from "@/lib/tiktok-pixel";
import * as snapchatPixel from "@/lib/snapchat-pixel";
import * as googleAnalytics from "@/lib/google-analytics";
import { createMetaEventId, getMetaBrowserIds } from "@/lib/meta/browser";
import { logTracking } from "@/lib/tracking/logger";
import { isTrackingPlatformActive } from "@/lib/tracking/runtime";
import {
  PURCHASE_TRACKED_PREFIX,
  TRACKING_CURRENCY,
  type AddToCartTrackingPayload,
  type CheckoutTrackingPayload,
  type PurchaseTrackingPayload,
  type ViewContentPayload,
} from "@/lib/tracking/types";

/** Fire PageView across all enabled platforms. */
export function trackPageView(url?: string): void {
  if (typeof window === "undefined") return;
  logTracking("PageView", { url });
  logTracking("PageView", { url }, "OpenAI");
  openaiPixel.pageview(url);
  if (isTrackingPlatformActive("facebook")) {
    logTracking("PageView", { url }, "Meta");
    facebookPixel.pageview();
  }
  if (isTrackingPlatformActive("tiktok")) {
    logTracking("PageView", { url }, "TikTok");
    tiktokPixel.pageview();
  }
  if (isTrackingPlatformActive("snapchat")) {
    logTracking("PageView", { url }, "Snapchat");
    snapchatPixel.pageview();
  }
  if (isTrackingPlatformActive("googleAnalytics")) {
    logTracking("PageView", { url }, "GA4");
    googleAnalytics.pageview(url);
  }
}

/** Mirror browser Meta events to server CAPI with the same event_id (fire-and-forget). */
function sendMetaCapiMirror(payload: {
  eventName: "ViewContent" | "AddToCart" | "InitiateCheckout";
  eventId: string;
  customData: Record<string, unknown>;
}): void {
  if (typeof window === "undefined") return;
  if (!isTrackingPlatformActive("facebook")) return;

  const ids = getMetaBrowserIds();
  const body = {
    eventName: payload.eventName,
    eventId: payload.eventId,
    eventSourceUrl: window.location.href,
    customData: payload.customData,
    userData: {
      ...(ids.fbp ? { fbp: ids.fbp } : {}),
      ...(ids.fbc ? { fbc: ids.fbc } : {}),
    },
  };

  try {
    const json = JSON.stringify(body);
    if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
      const blob = new Blob([json], { type: "application/json" });
      navigator.sendBeacon("/api/meta/capi", blob);
      return;
    }
  } catch {
    /* fall through to fetch */
  }

  void fetch("/api/meta/capi", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    keepalive: true,
  }).catch(() => null);
}

export function trackViewContent(payload: ViewContentPayload): void {
  if (typeof window === "undefined") return;
  const eventId = payload.eventId || createMetaEventId("vc");
  const quantity = payload.quantity ?? 1;
  const value = payload.price * quantity;

  logTracking("ViewContent", { ...payload, eventId });
  logTracking("ViewContent", { ...payload, eventId }, "OpenAI");
  openaiPixel.trackViewContent({ ...payload, eventId });
  if (isTrackingPlatformActive("facebook")) {
    logTracking("ViewContent", { ...payload, eventId }, "Meta");
    facebookPixel.trackViewContent({ ...payload, eventId });
    sendMetaCapiMirror({
      eventName: "ViewContent",
      eventId,
      customData: {
        content_ids: [payload.productId],
        content_name: payload.name,
        content_type: "product",
        value,
        currency: TRACKING_CURRENCY,
      },
    });
  }
  if (isTrackingPlatformActive("tiktok")) {
    logTracking("ViewContent", payload, "TikTok");
    tiktokPixel.trackViewContent(payload);
  }
  if (isTrackingPlatformActive("snapchat")) {
    logTracking("ViewContent", payload, "Snapchat");
    snapchatPixel.trackViewContent(payload);
  }
  if (isTrackingPlatformActive("googleAnalytics")) {
    logTracking("ViewContent", payload, "GA4");
    googleAnalytics.trackViewContent(payload);
  }
}

export function trackAddToCart(payload: AddToCartTrackingPayload): void {
  if (typeof window === "undefined") return;
  const eventId = payload.eventId || createMetaEventId("atc");
  const value = payload.price * payload.quantity;

  logTracking("AddToCart", { ...payload, eventId });
  logTracking("AddToCart", { ...payload, eventId }, "OpenAI");
  openaiPixel.trackAddToCart({ ...payload, eventId });
  if (isTrackingPlatformActive("facebook")) {
    logTracking("AddToCart", { ...payload, eventId }, "Meta");
    facebookPixel.trackAddToCart({ ...payload, eventId });
    sendMetaCapiMirror({
      eventName: "AddToCart",
      eventId,
      customData: {
        content_ids: [payload.productId],
        content_name: payload.name,
        content_type: "product",
        value,
        currency: TRACKING_CURRENCY,
        num_items: payload.quantity,
        contents: [
          {
            id: payload.productId,
            quantity: payload.quantity,
            item_price: payload.price,
          },
        ],
      },
    });
  }
  if (isTrackingPlatformActive("tiktok")) {
    logTracking("AddToCart", payload, "TikTok");
    tiktokPixel.trackAddToCart(payload);
  }
  if (isTrackingPlatformActive("snapchat")) {
    logTracking("AddToCart", payload, "Snapchat");
    snapchatPixel.trackAddToCart(payload);
  }
  if (isTrackingPlatformActive("googleAnalytics")) {
    logTracking("AddToCart", payload, "GA4");
    googleAnalytics.trackAddToCart(payload);
  }
}

export function trackInitiateCheckout(payload: CheckoutTrackingPayload): void {
  if (typeof window === "undefined") return;
  const eventId = payload.eventId || createMetaEventId("ic");
  const numItems = payload.products.reduce((sum, p) => sum + p.quantity, 0);
  const contents = payload.products.map((p) => ({
    id: p.productId,
    quantity: p.quantity,
    item_price: p.price,
  }));

  logTracking("InitiateCheckout", { ...payload, eventId });
  logTracking("InitiateCheckout", { ...payload, eventId }, "OpenAI");
  openaiPixel.trackInitiateCheckout({
    products: payload.products,
    total: payload.total,
    eventId,
  });
  if (isTrackingPlatformActive("facebook")) {
    logTracking("InitiateCheckout", { ...payload, eventId }, "Meta");
    facebookPixel.trackInitiateCheckout({
      products: payload.products,
      total: payload.total,
      eventId,
    });
    sendMetaCapiMirror({
      eventName: "InitiateCheckout",
      eventId,
      customData: {
        content_ids: payload.products.map((p) => p.productId),
        contents,
        content_type: "product",
        value: payload.total,
        currency: TRACKING_CURRENCY,
        num_items: numItems,
      },
    });
  }
  if (isTrackingPlatformActive("tiktok")) {
    logTracking("InitiateCheckout", payload, "TikTok");
    tiktokPixel.trackInitiateCheckout(payload);
  }
  if (isTrackingPlatformActive("snapchat")) {
    logTracking("InitiateCheckout", payload, "Snapchat");
    snapchatPixel.trackInitiateCheckout(payload);
  }
  if (isTrackingPlatformActive("googleAnalytics")) {
    logTracking("InitiateCheckout", payload, "GA4");
    googleAnalytics.trackInitiateCheckout(payload);
  }
}

/**
 * Browser-side Purchase (Meta Pixel + other platforms + OpenAI `order_created`).
 * Must only be called after the backend has accepted the order.
 * Meta CAPI Purchase is sent from /api/orders with the same eventId.
 * OpenAI Ads conversion: oaiq("measure", "order_created", { type: "contents", ... }).
 */
export function trackPurchase(payload: PurchaseTrackingPayload): void {
  if (typeof window === "undefined") return;
  if (isPurchaseAlreadyTracked(payload.orderId)) return;

  const eventId =
    payload.eventId || `purchase_${payload.orderId.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 40)}`;
  const normalized = {
    ...payload,
    currency: payload.currency ?? TRACKING_CURRENCY,
    eventId,
  };

  logTracking("Purchase", normalized);
  logTracking("Purchase", normalized, "OpenAI");
  openaiPixel.trackPurchase(normalized);

  if (isTrackingPlatformActive("facebook")) {
    logTracking("Purchase", normalized, "Meta");
    facebookPixel.trackPurchase(normalized);
  }
  if (isTrackingPlatformActive("tiktok")) {
    logTracking("Purchase", normalized, "TikTok");
    tiktokPixel.trackPurchase(normalized);
  }
  if (isTrackingPlatformActive("snapchat")) {
    logTracking("Purchase", normalized, "Snapchat");
    snapchatPixel.trackPurchase(normalized);
  }
  if (isTrackingPlatformActive("googleAnalytics")) {
    logTracking("Purchase", normalized, "GA4");
    googleAnalytics.trackPurchase(normalized);
  }

  markPurchaseTracked(payload.orderId);
}

export function isPurchaseAlreadyTracked(orderId: string): boolean {
  try {
    return sessionStorage.getItem(`${PURCHASE_TRACKED_PREFIX}${orderId}`) === "1";
  } catch {
    return false;
  }
}

export function markPurchaseTracked(orderId: string): void {
  try {
    sessionStorage.setItem(`${PURCHASE_TRACKED_PREFIX}${orderId}`, "1");
  } catch {
    /* ignore quota errors */
  }
}
