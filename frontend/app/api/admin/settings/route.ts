import { type NextRequest, NextResponse } from "next/server";

import { isAdminRequest } from "@/lib/admin/auth";
import { DEFAULT_SITE_SETTINGS, type SiteSettings } from "@/lib/admin/cms-types";
import { logAudit } from "@/lib/server/audit";
import { revalidatePublicContent } from "@/lib/server/revalidate";
import { readStore, updateStore } from "@/lib/server/store";

export async function GET(req: NextRequest) {
  if (!(await isAdminRequest(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const store = await readStore();
  return NextResponse.json({ siteSettings: store.siteSettings });
}

export async function PUT(req: NextRequest) {
  if (!(await isAdminRequest(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  let body: Partial<SiteSettings>;
  try {
    body = (await req.json()) as Partial<SiteSettings>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const siteSettings: SiteSettings = { ...DEFAULT_SITE_SETTINGS };
  for (const key of Object.keys(DEFAULT_SITE_SETTINGS) as (keyof SiteSettings)[]) {
    const value = body[key];
    if (typeof value === "string") siteSettings[key] = value.trim();
  }
  if (!siteSettings.brandName) siteSettings.brandName = DEFAULT_SITE_SETTINGS.brandName;
  const store = await updateStore((prev) => ({ ...prev, siteSettings }));
  void logAudit("Site settings updated", "settings");
  revalidatePublicContent();
  return NextResponse.json({ siteSettings: store.siteSettings });
}
