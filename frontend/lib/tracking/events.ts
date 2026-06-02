import * as facebookPixel from "@/lib/facebook-pixel";
import * as tiktokPixel from "@/lib/tiktok-pixel";
import * as snapchatPixel from "@/lib/snapchat-pixel";
import * as googleAnalytics from "@/lib/google-analytics";
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

export function trackViewContent(payload: ViewContentPayload): void {
  if (typeof window === "undefined") return;
  logTracking("ViewContent", payload);
  if (isTrackingPlatformActive("facebook")) {
    logTracking("ViewContent", payload, "Meta");
    facebookPixel.trackViewContent(payload);
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
  logTracking("AddToCart", payload);
  if (isTrackingPlatformActive("facebook")) {
    logTracking("AddToCart", payload, "Meta");
    facebookPixel.trackAddToCart(payload);
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
  logTracking("InitiateCheckout", payload);
  if (isTrackingPlatformActive("facebook")) {
    logTracking("InitiateCheckout", payload, "Meta");
    facebookPixel.trackInitiateCheckout(payload);
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

export function trackPurchase(payload: PurchaseTrackingPayload): void {
  if (typeof window === "undefined") return;
  if (isPurchaseAlreadyTracked(payload.orderId)) return;

  const normalized = {
    ...payload,
    currency: payload.currency ?? TRACKING_CURRENCY,
  };

  logTracking("Purchase", normalized);

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
