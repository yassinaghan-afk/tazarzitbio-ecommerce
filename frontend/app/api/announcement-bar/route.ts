import { NextResponse } from "next/server";

import { normalizeAnnouncementBar } from "@/lib/admin/announcement-bar";
import { readStore } from "@/lib/server/store";

export async function GET() {
  const store = await readStore();
  return NextResponse.json({
    announcementBar: normalizeAnnouncementBar(store.announcementBar),
  });
}
