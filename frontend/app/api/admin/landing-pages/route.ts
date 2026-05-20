import { type NextRequest, NextResponse } from "next/server";

import { isAdminRequest } from "@/lib/admin/auth";
import type { LandingPage } from "@/lib/admin/types";
import { readStore, updateStore } from "@/lib/server/store";

export async function GET(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const store = await readStore();
  return NextResponse.json({ landingPages: store.landingPages });
}

export async function POST(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = (await req.json()) as Partial<LandingPage>;
  const id = body.id ?? crypto.randomUUID();
  const page: LandingPage = {
    id,
    slug: body.slug ?? `page-${id.slice(0, 8)}`,
    featuredProductSlug: body.featuredProductSlug ?? "",
    headline: body.headline ?? "",
    subheadline: body.subheadline ?? "",
    ctaText: body.ctaText ?? "Order Now",
    sections: body.sections ?? [],
    isEnabled: body.isEnabled ?? false,
    createdAt: body.createdAt ?? new Date().toISOString(),
  };
  const store = await updateStore((prev) => {
    const exists = prev.landingPages.find((p) => p.id === id);
    const landingPages = exists
      ? prev.landingPages.map((p) => (p.id === id ? page : p))
      : [...prev.landingPages, page];
    return { ...prev, landingPages };
  });
  return NextResponse.json({ landingPage: page, landingPages: store.landingPages });
}

export async function DELETE(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const store = await updateStore((prev) => ({
    ...prev,
    landingPages: prev.landingPages.filter((p) => p.id !== id),
  }));
  return NextResponse.json({ landingPages: store.landingPages });
}
