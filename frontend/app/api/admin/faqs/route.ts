import { type NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";

import { isAdminRequest } from "@/lib/admin/auth";
import type { FaqRecord } from "@/lib/admin/cms-types";
import { logAudit } from "@/lib/server/audit";
import { revalidatePublicContent } from "@/lib/server/revalidate";
import { readStore, updateStore } from "@/lib/server/store";

function sanitize(input: Partial<FaqRecord>): FaqRecord | null {
  const questionAr = (input.questionAr ?? "").toString().trim();
  const questionFr = (input.questionFr ?? "").toString().trim();
  if (!questionAr && !questionFr) return null;
  return {
    id: (input.id ?? "").toString() || `faq-${crypto.randomUUID().slice(0, 8)}`,
    questionAr,
    answerAr: (input.answerAr ?? "").toString(),
    questionFr,
    answerFr: (input.answerFr ?? "").toString(),
    productSlug: (input.productSlug ?? "").toString(),
    sortOrder: Number.isFinite(input.sortOrder) ? Number(input.sortOrder) : 999,
    isActive: input.isActive !== false,
  };
}

export async function GET(req: NextRequest) {
  if (!(await isAdminRequest(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const store = await readStore();
  return NextResponse.json({ faqs: store.faqs });
}

export async function POST(req: NextRequest) {
  if (!(await isAdminRequest(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  let body: Partial<FaqRecord>;
  try {
    body = (await req.json()) as Partial<FaqRecord>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const record = sanitize(body);
  if (!record) {
    return NextResponse.json({ error: "A question is required" }, { status: 400 });
  }
  const store = await updateStore((prev) => {
    const exists = prev.faqs.some((f) => f.id === record.id);
    return {
      ...prev,
      faqs: exists
        ? prev.faqs.map((f) => (f.id === record.id ? record : f))
        : [...prev.faqs, record],
    };
  });
  void logAudit("FAQ saved", "faq", record.id);
  revalidatePublicContent();
  return NextResponse.json({ faqs: store.faqs });
}

/** PUT replaces the whole list — used for reordering */
export async function PUT(req: NextRequest) {
  if (!(await isAdminRequest(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  let body: { faqs?: FaqRecord[] };
  try {
    body = (await req.json()) as { faqs?: FaqRecord[] };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (!Array.isArray(body.faqs)) {
    return NextResponse.json({ error: "faqs array required" }, { status: 400 });
  }
  const cleaned = body.faqs
    .map((f) => sanitize(f))
    .filter((f): f is FaqRecord => f !== null)
    .map((f, i) => ({ ...f, sortOrder: i }));
  const store = await updateStore((prev) => ({ ...prev, faqs: cleaned }));
  void logAudit("FAQs reordered", "faq");
  revalidatePublicContent();
  return NextResponse.json({ faqs: store.faqs });
}

export async function DELETE(req: NextRequest) {
  if (!(await isAdminRequest(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const store = await updateStore((prev) => ({
    ...prev,
    faqs: prev.faqs.filter((f) => f.id !== id),
  }));
  void logAudit("FAQ deleted", "faq", id);
  revalidatePublicContent();
  return NextResponse.json({ faqs: store.faqs });
}
