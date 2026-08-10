import { type NextRequest, NextResponse } from "next/server";

import { isAdminRequest } from "@/lib/admin/auth";
import type { LpBlock } from "@/lib/admin/cms-types";
import { slugify } from "@/lib/admin/product-types";
import type { LandingPage } from "@/lib/admin/types";
import { logAudit } from "@/lib/server/audit";
import { revalidatePublicContent } from "@/lib/server/revalidate";
import { readStore, updateStore } from "@/lib/server/store";

function sanitizeBlocks(raw: unknown): LpBlock[] {
  if (!Array.isArray(raw)) return [];
  return (raw as Partial<LpBlock>[]).map((b, i) => ({
    id: (b.id ?? "").toString() || `blk-${i}-${Date.now()}`,
    type: (b.type ?? "text") as LpBlock["type"],
    isVisible: b.isVisible !== false,
    title: (b.title ?? "").toString(),
    subtitle: (b.subtitle ?? "").toString(),
    text: (b.text ?? "").toString(),
    imageUrl: (b.imageUrl ?? "").toString(),
    images: Array.isArray(b.images) ? b.images.map((s) => s.toString()) : [],
    videoUrl: (b.videoUrl ?? "").toString(),
    ctaText: (b.ctaText ?? "").toString(),
    ctaHref: (b.ctaHref ?? "").toString(),
    items: Array.isArray(b.items)
      ? b.items.map((it) => ({
          title: (it?.title ?? "").toString(),
          body: (it?.body ?? "").toString(),
        }))
      : [],
    countdownTo: (b.countdownTo ?? "").toString(),
    background: (["default", "alt", "dark", "gold"] as const).includes(
      b.background as "default",
    )
      ? (b.background as LpBlock["background"])
      : "default",
  }));
}

export async function GET(req: NextRequest) {
  if (!(await isAdminRequest(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const store = await readStore();
  return NextResponse.json({ landingPages: store.landingPages });
}

export async function POST(req: NextRequest) {
  if (!(await isAdminRequest(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  let body: Partial<LandingPage>;
  try {
    body = (await req.json()) as Partial<LandingPage>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const id = body.id || crypto.randomUUID();
  const slug = slugify((body.slug ?? "").toString());
  if (!slug) {
    return NextResponse.json({ error: "A URL slug is required" }, { status: 400 });
  }
  const current = await readStore();
  if (current.landingPages.some((p) => p.slug === slug && p.id !== id)) {
    return NextResponse.json(
      { error: `Slug "/lp/${slug}" is already used by another page` },
      { status: 409 },
    );
  }
  const now = new Date().toISOString();
  const page: LandingPage = {
    id,
    slug,
    featuredProductSlug: (body.featuredProductSlug ?? "").toString(),
    headline: (body.headline ?? "").toString(),
    subheadline: (body.subheadline ?? "").toString(),
    ctaText: (body.ctaText ?? "Order Now").toString(),
    sections: [],
    blocks: sanitizeBlocks(body.blocks),
    isEnabled: body.isEnabled === true,
    seoTitle: (body.seoTitle ?? "").toString(),
    seoDescription: (body.seoDescription ?? "").toString(),
    ogImage: (body.ogImage ?? "").toString(),
    createdAt: (body.createdAt ?? now).toString(),
    updatedAt: now,
  };
  const store = await updateStore((prev) => {
    const exists = prev.landingPages.find((p) => p.id === id);
    const landingPages = exists
      ? prev.landingPages.map((p) => (p.id === id ? page : p))
      : [...prev.landingPages, page];
    return { ...prev, landingPages };
  });
  void logAudit(
    `Landing page "/lp/${page.slug}" ${page.isEnabled ? "published" : "saved as draft"}`,
    "landing-page",
    page.id,
  );
  revalidatePublicContent();
  return NextResponse.json({ landingPage: page, landingPages: store.landingPages });
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
    landingPages: prev.landingPages.filter((p) => p.id !== id),
  }));
  void logAudit("Landing page deleted", "landing-page", id);
  revalidatePublicContent();
  return NextResponse.json({ landingPages: store.landingPages });
}
