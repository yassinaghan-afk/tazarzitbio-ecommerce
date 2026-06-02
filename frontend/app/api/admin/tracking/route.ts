import { type NextRequest, NextResponse } from "next/server";

import { isAdminRequest } from "@/lib/admin/auth";
import { readStore, updateStore } from "@/lib/server/store";
import { normalizeTrackingSettings } from "@/lib/tracking/settings";
import type { TrackingSettings } from "@/lib/tracking/types";

export async function GET(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const store = await readStore();
  return NextResponse.json({
    tracking: normalizeTrackingSettings(store.trackingSettings),
  });
}

export async function PUT(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = (await req.json()) as Partial<TrackingSettings>;
  const trackingSettings = normalizeTrackingSettings(body);
  const store = await updateStore((prev) => ({
    ...prev,
    trackingSettings,
  }));
  return NextResponse.json({
    tracking: normalizeTrackingSettings(store.trackingSettings),
  });
}
