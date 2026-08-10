import { NextResponse } from "next/server";

import { getMetaPixelId } from "@/lib/meta/env";
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

  // EasyPanel META_PIXEL_ID is the production source of truth when Admin has no custom ID.
  if (envPixelId) {
    const adminFb = store.trackingSettings?.facebook;
    if (!adminFb?.id) {
      tracking.facebook = {
        id: envPixelId,
        // Allow admin to disable Pixel without clearing env id
        enabled: adminFb?.enabled === false ? false : true,
      };
    }
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
