import { NextResponse } from "next/server";

import { getMetaPixelId } from "@/lib/meta/env";
import { resolveTikTokPixelId } from "@/lib/tiktok/pixel-id";
import { readStore } from "@/lib/server/store";
import { resolveTrackingSettings } from "@/lib/tracking/settings";

export const dynamic = "force-dynamic";

/**
 * Public endpoint — returns non-secret marketing pixel IDs for client-side loading.
 * Never returns META_CAPI_ACCESS_TOKEN or other secrets.
 */
export async function GET() {
  const store = await readStore();
  const tracking = resolveTrackingSettings(store.trackingSettings);
  const envPixelId = getMetaPixelId();
  const envTikTokId = resolveTikTokPixelId();

  // Always expose the production Meta Pixel ID (public dataset).
  // Admin can disable via facebook.enabled = false; empty admin id uses env/default.
  const adminFb = store.trackingSettings?.facebook;
  if (!adminFb?.id) {
    tracking.facebook = {
      id: envPixelId,
      enabled: adminFb?.enabled === false ? false : true,
    };
  } else if (!tracking.facebook.id) {
    tracking.facebook = {
      id: envPixelId,
      enabled: tracking.facebook.enabled !== false,
    };
  }

  // Always expose the production TikTok Pixel ID (public).
  // Admin can disable via tiktok.enabled = false; empty admin id uses env/default.
  const adminTt = store.trackingSettings?.tiktok;
  if (!adminTt?.id) {
    tracking.tiktok = {
      id: envTikTokId,
      enabled: adminTt?.enabled === false ? false : true,
    };
  } else if (!tracking.tiktok.id) {
    tracking.tiktok = {
      id: envTikTokId,
      enabled: tracking.tiktok.enabled !== false,
    };
  }

  return NextResponse.json(
    { tracking },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
