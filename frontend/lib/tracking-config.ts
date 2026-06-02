/**
 * Default tracking IDs — overridden at runtime by admin settings (/api/tracking)
 * and at build time by NEXT_PUBLIC_* env vars when set.
 */
export const trackingConfig = {
  facebookPixelId: process.env.NEXT_PUBLIC_META_PIXEL_ID ?? "",
  tiktokPixelId: process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID ?? "",
  snapchatPixelId: process.env.NEXT_PUBLIC_SNAPCHAT_PIXEL_ID ?? "",
  googleAnalyticsId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "",
  googleTagManagerId: process.env.NEXT_PUBLIC_GTM_ID ?? "",
  microsoftClarityId: process.env.NEXT_PUBLIC_CLARITY_ID ?? "",
};

export type TrackingConfig = typeof trackingConfig;
