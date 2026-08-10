export const TRACKING_CURRENCY = "MAD" as const;

export type TrackingPlatformKey =
  | "facebook"
  | "tiktok"
  | "snapchat"
  | "googleAnalytics"
  | "googleTagManager"
  | "microsoftClarity";

export interface TrackingPlatformConfig {
  id: string;
  enabled: boolean;
}

export interface TrackingSettings {
  facebook: TrackingPlatformConfig;
  tiktok: TrackingPlatformConfig;
  snapchat: TrackingPlatformConfig;
  googleAnalytics: TrackingPlatformConfig;
  googleTagManager: TrackingPlatformConfig;
  microsoftClarity: TrackingPlatformConfig;
  /** Log all events to browser console (dev debugging + production verification). */
  testMode: boolean;
}

/** @deprecated Legacy flat shape — migrated automatically. */
export interface LegacyTrackingSettings {
  facebookPixelId?: string;
  tiktokPixelId?: string;
  snapchatPixelId?: string;
  googleAnalyticsId?: string;
  googleTagManagerId?: string;
  microsoftClarityId?: string;
  facebookEnabled?: boolean;
  tiktokEnabled?: boolean;
  snapchatEnabled?: boolean;
  googleAnalyticsEnabled?: boolean;
  googleTagManagerEnabled?: boolean;
  microsoftClarityEnabled?: boolean;
  testMode?: boolean;
}

export interface TrackingProduct {
  productId: string;
  slug: string;
  name: string;
  price: number;
  quantity: number;
}

export interface ViewContentPayload {
  productId: string;
  slug: string;
  name: string;
  price: number;
  quantity?: number;
  /** Shared Meta Pixel + CAPI event_id for deduplication */
  eventId?: string;
}

export interface AddToCartTrackingPayload {
  productId: string;
  slug: string;
  name: string;
  price: number;
  quantity: number;
  eventId?: string;
}

export interface CheckoutTrackingPayload {
  products: TrackingProduct[];
  subtotal: number;
  total: number;
  eventId?: string;
}

export interface PurchaseTrackingPayload {
  orderId: string;
  products: TrackingProduct[];
  subtotal: number;
  shipping?: number;
  total: number;
  currency?: typeof TRACKING_CURRENCY;
  /** Must match server CAPI Purchase event_id */
  eventId?: string;
}

export const PURCHASE_TRACKED_PREFIX = "tazarzit-tracked-purchase-";
