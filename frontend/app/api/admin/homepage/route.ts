import { type NextRequest, NextResponse } from "next/server";

import { isAdminRequest } from "@/lib/admin/auth";
import type { HomepageContent } from "@/lib/admin/types";
import { readStore, updateStore } from "@/lib/server/store";

export async function GET(req: NextRequest) {
  if (!(await isAdminRequest(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const store = await readStore();
  return NextResponse.json({ homepageContent: store.homepageContent });
}

export async function PUT(req: NextRequest) {
  if (!(await isAdminRequest(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = (await req.json()) as Partial<HomepageContent>;
  const store = await updateStore((prev) => ({
    ...prev,
    homepageContent: { ...prev.homepageContent, ...body },
  }));
  return NextResponse.json({ homepageContent: store.homepageContent });
}
