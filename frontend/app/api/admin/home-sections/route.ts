import { type NextRequest, NextResponse } from "next/server";

import { isAdminRequest } from "@/lib/admin/auth";
import {
  DEFAULT_HOME_SECTIONS,
  type HomeSectionConfig,
} from "@/lib/admin/cms-types";
import { logAudit } from "@/lib/server/audit";
import { revalidatePublicContent } from "@/lib/server/revalidate";
import { readStore, updateStore } from "@/lib/server/store";

export async function GET(req: NextRequest) {
  if (!(await isAdminRequest(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const store = await readStore();
  return NextResponse.json({ homeSections: store.homeSections });
}

export async function PUT(req: NextRequest) {
  if (!(await isAdminRequest(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  let body: { homeSections?: HomeSectionConfig[] };
  try {
    body = (await req.json()) as { homeSections?: HomeSectionConfig[] };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const known = new Set(DEFAULT_HOME_SECTIONS.map((s) => s.id));
  const raw = Array.isArray(body.homeSections) ? body.homeSections : [];
  const seen = new Set<string>();
  const homeSections = raw
    .filter((s) => s && known.has(s.id) && !seen.has(s.id) && seen.add(s.id))
    .map((s) => ({ id: s.id, isVisible: s.isVisible !== false }));
  for (const def of DEFAULT_HOME_SECTIONS) {
    if (!seen.has(def.id)) homeSections.push(def);
  }
  const store = await updateStore((prev) => ({ ...prev, homeSections }));
  void logAudit("Homepage sections updated", "homepage");
  revalidatePublicContent();
  return NextResponse.json({ homeSections: store.homeSections });
}
