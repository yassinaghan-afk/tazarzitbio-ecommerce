import { type NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";

import { isAdminRequest } from "@/lib/admin/auth";
import type { ReviewRecord } from "@/lib/admin/cms-types";
import { logAudit } from "@/lib/server/audit";
import { revalidatePublicContent } from "@/lib/server/revalidate";
import { readStore, updateStore } from "@/lib/server/store";

function sanitize(input: Partial<ReviewRecord>): ReviewRecord | null {
  const author = (input.author ?? "").toString().trim();
  const text = (input.text ?? "").toString().trim();
  if (!author || !text) return null;
  const rating = Math.min(5, Math.max(1, Math.round(Number(input.rating) || 5)));
  return {
    id: (input.id ?? "").toString() || `rev-${crypto.randomUUID().slice(0, 8)}`,
    productSlug: (input.productSlug ?? "").toString(),
    author,
    city: (input.city ?? "").toString(),
    rating,
    text,
    date: (input.date ?? "").toString() || new Date().toLocaleDateString("fr-MA"),
    photo: (input.photo ?? "").toString(),
    isApproved: Boolean(input.isApproved),
    isFeatured: Boolean(input.isFeatured),
    createdAt: (input.createdAt ?? new Date().toISOString()).toString(),
  };
}

export async function GET(req: NextRequest) {
  if (!(await isAdminRequest(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const store = await readStore();
  return NextResponse.json({ reviews: store.reviews });
}

export async function POST(req: NextRequest) {
  if (!(await isAdminRequest(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  let body: Partial<ReviewRecord>;
  try {
    body = (await req.json()) as Partial<ReviewRecord>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const record = sanitize(body);
  if (!record) {
    return NextResponse.json(
      { error: "Author and review text are required" },
      { status: 400 },
    );
  }
  const store = await updateStore((prev) => {
    const exists = prev.reviews.some((r) => r.id === record.id);
    return {
      ...prev,
      reviews: exists
        ? prev.reviews.map((r) => (r.id === record.id ? record : r))
        : [record, ...prev.reviews],
    };
  });
  void logAudit(`Review by "${record.author}" saved`, "review", record.id);
  revalidatePublicContent();
  return NextResponse.json({ reviews: store.reviews });
}

export async function DELETE(req: NextRequest) {
  if (!(await isAdminRequest(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const store = await updateStore((prev) => ({
    ...prev,
    reviews: prev.reviews.filter((r) => r.id !== id),
  }));
  void logAudit("Review deleted", "review", id);
  revalidatePublicContent();
  return NextResponse.json({ reviews: store.reviews });
}
