import { type NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";

import { isAdminRequest } from "@/lib/admin/auth";
import type { CategoryRecord } from "@/lib/admin/cms-types";
import { slugify } from "@/lib/admin/product-types";
import { logAudit } from "@/lib/server/audit";
import { revalidatePublicContent } from "@/lib/server/revalidate";
import { readStore, updateStore } from "@/lib/server/store";

function sanitize(input: Partial<CategoryRecord>): CategoryRecord | null {
  const nameAr = (input.nameAr ?? "").toString().trim();
  const nameFr = (input.nameFr ?? "").toString().trim();
  if (!nameAr && !nameFr) return null;
  const now = new Date().toISOString();
  return {
    id: (input.id ?? "").toString() || `cat-${crypto.randomUUID().slice(0, 8)}`,
    slug: slugify((input.slug ?? "").toString()) || slugify(nameFr || nameAr) || `cat-${Date.now()}`,
    nameAr,
    nameFr,
    description: (input.description ?? "").toString(),
    image: (input.image ?? "").toString(),
    sortOrder: Number.isFinite(input.sortOrder) ? Number(input.sortOrder) : 999,
    isFeatured: Boolean(input.isFeatured),
    isVisible: input.isVisible !== false,
    seoTitle: (input.seoTitle ?? "").toString(),
    seoDescription: (input.seoDescription ?? "").toString(),
    createdAt: (input.createdAt ?? now).toString(),
    updatedAt: now,
  };
}

export async function GET(req: NextRequest) {
  if (!(await isAdminRequest(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const store = await readStore();
  return NextResponse.json({ categories: store.categories });
}

export async function POST(req: NextRequest) {
  if (!(await isAdminRequest(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  let body: Partial<CategoryRecord>;
  try {
    body = (await req.json()) as Partial<CategoryRecord>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const record = sanitize(body);
  if (!record) {
    return NextResponse.json({ error: "Category name is required" }, { status: 400 });
  }
  const store = await updateStore((prev) => {
    const exists = prev.categories.some((c) => c.id === record.id);
    return {
      ...prev,
      categories: exists
        ? prev.categories.map((c) => (c.id === record.id ? record : c))
        : [...prev.categories, record],
    };
  });
  void logAudit(`Category "${record.nameFr || record.nameAr}" saved`, "category", record.id);
  revalidatePublicContent();
  return NextResponse.json({ categories: store.categories });
}

/** PUT replaces the whole list — used for drag-and-drop reordering */
export async function PUT(req: NextRequest) {
  if (!(await isAdminRequest(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  let body: { categories?: CategoryRecord[] };
  try {
    body = (await req.json()) as { categories?: CategoryRecord[] };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (!Array.isArray(body.categories)) {
    return NextResponse.json({ error: "categories array required" }, { status: 400 });
  }
  const cleaned = body.categories
    .map((c) => sanitize(c))
    .filter((c): c is CategoryRecord => c !== null)
    .map((c, i) => ({ ...c, sortOrder: i }));
  const store = await updateStore((prev) => ({ ...prev, categories: cleaned }));
  void logAudit("Categories reordered", "category");
  revalidatePublicContent();
  return NextResponse.json({ categories: store.categories });
}

export async function DELETE(req: NextRequest) {
  if (!(await isAdminRequest(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const store = await updateStore((prev) => ({
    ...prev,
    categories: prev.categories.filter((c) => c.id !== id),
  }));
  void logAudit("Category deleted", "category", id);
  revalidatePublicContent();
  return NextResponse.json({ categories: store.categories });
}
