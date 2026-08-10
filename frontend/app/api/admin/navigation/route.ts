import { type NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";

import { isAdminRequest } from "@/lib/admin/auth";
import type { NavigationSettings, NavLinkRecord } from "@/lib/admin/cms-types";
import { logAudit } from "@/lib/server/audit";
import { revalidatePublicContent } from "@/lib/server/revalidate";
import { readStore, updateStore } from "@/lib/server/store";

function sanitizeLinks(raw: unknown): NavLinkRecord[] {
  if (!Array.isArray(raw)) return [];
  return (raw as Partial<NavLinkRecord>[])
    .map((l, i) => ({
      id: (l.id ?? "").toString() || `nav-${crypto.randomUUID().slice(0, 8)}`,
      labelAr: (l.labelAr ?? "").toString(),
      labelFr: (l.labelFr ?? "").toString(),
      labelEn: (l.labelEn ?? "").toString(),
      href: (l.href ?? "").toString(),
      isVisible: l.isVisible !== false,
      sortOrder: i,
    }))
    .filter((l) => l.href && (l.labelAr || l.labelFr || l.labelEn));
}

export async function GET(req: NextRequest) {
  if (!(await isAdminRequest(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const store = await readStore();
  return NextResponse.json({ navigation: store.navigation });
}

export async function PUT(req: NextRequest) {
  if (!(await isAdminRequest(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  let body: Partial<NavigationSettings>;
  try {
    body = (await req.json()) as Partial<NavigationSettings>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const navigation: NavigationSettings = {
    header: sanitizeLinks(body.header),
    footerShop: sanitizeLinks(body.footerShop),
    footerInfo: sanitizeLinks(body.footerInfo),
  };
  const store = await updateStore((prev) => ({ ...prev, navigation }));
  void logAudit("Navigation menus updated", "navigation");
  revalidatePublicContent();
  return NextResponse.json({ navigation: store.navigation });
}
