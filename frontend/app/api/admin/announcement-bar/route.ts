import { type NextRequest, NextResponse } from "next/server";

import { isAdminRequest } from "@/lib/admin/auth";
import {
  normalizeAnnouncementBar,
  type AnnouncementBarConfig,
} from "@/lib/admin/announcement-bar";
import { readStore, updateStore } from "@/lib/server/store";

export async function GET(req: NextRequest) {
  if (!(await isAdminRequest(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const store = await readStore();
  return NextResponse.json({
    announcementBar: normalizeAnnouncementBar(store.announcementBar),
  });
}

export async function PUT(req: NextRequest) {
  if (!(await isAdminRequest(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = (await req.json()) as Partial<AnnouncementBarConfig>;
  const announcementBar = normalizeAnnouncementBar(body);
  const store = await updateStore((prev) => ({
    ...prev,
    announcementBar,
  }));
  return NextResponse.json({
    announcementBar: normalizeAnnouncementBar(store.announcementBar),
  });
}
