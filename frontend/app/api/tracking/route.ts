import { NextResponse } from "next/server";

import { readStore } from "@/lib/server/store";
import { resolveTrackingSettings } from "@/lib/tracking/settings";

/** Public endpoint — returns non-secret marketing pixel IDs for client-side loading. */
export async function GET() {
  const store = await readStore();
  const tracking = resolveTrackingSettings(store.trackingSettings);
  return NextResponse.json(
    { tracking },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
