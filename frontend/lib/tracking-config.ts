/**
 * Default tracking IDs — overridden at runtime by admin settings (/api/tracking)
 * and by META_PIXEL_ID / NEXT_PUBLIC_* env when set.
 *
 * Meta Pixel ID falls back to the official TazarzitBio dataset ID (public).
 * TikTok Pixel ID falls back to the official TazarzitBio Pixel ID (public).
 */
import { META_PIXEL_DATASET_ID } from "@/lib/meta/pixel-id";
import { TIKTOK_PIXEL_DATASET_ID } from "@/lib/tiktok/pixel-id";

export const trackingConfig = {
  facebookPixelId:
    process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim() || META_PIXEL_DATASET_ID,
  tiktokPixelId:
    process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID?.trim() || TIKTOK_PIXEL_DATASET_ID,
  snapchatPixelId: process.env.NEXT_PUBLIC_SNAPCHAT_PIXEL_ID ?? "",
  googleAnalyticsId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "",
  googleTagManagerId: process.env.NEXT_PUBLIC_GTM_ID ?? "",
  microsoftClarityId: process.env.NEXT_PUBLIC_CLARITY_ID ?? "",
};

export type TrackingConfig = typeof trackingConfig;
