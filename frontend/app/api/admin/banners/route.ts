import { type NextRequest, NextResponse } from "next/server";

import { isAdminRequest } from "@/lib/admin/auth";
import type { Banner } from "@/lib/admin/types";
import { readStore, updateStore } from "@/lib/server/store";

export async function GET(req: NextRequest) {
  if (!(await isAdminRequest(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const store = await readStore();
  return NextResponse.json({ banners: store.banners });
}

export async function POST(req: NextRequest) {
  if (!(await isAdminRequest(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = (await req.json()) as Partial<Banner>;
  const id = body.id ?? crypto.randomUUID();
  const banner: Banner = {
    id,
    text: body.text ?? "",
    imageUrl: body.imageUrl,
    placement: body.placement ?? "top-bar",
    isEnabled: body.isEnabled ?? true,
    createdAt: body.createdAt ?? new Date().toISOString(),
  };
  const store = await updateStore((prev) => {
    const exists = prev.banners.find((b) => b.id === id);
    const banners = exists
      ? prev.banners.map((b) => (b.id === id ? banner : b))
      : [...prev.banners, banner];
    return { ...prev, banners };
  });
  return NextResponse.json({ banner, banners: store.banners });
}

export async function DELETE(req: NextRequest) {
  if (!(await isAdminRequest(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const store = await updateStore((prev) => ({
    ...prev,
    banners: prev.banners.filter((b) => b.id !== id),
  }));
  return NextResponse.json({ banners: store.banners });
}
