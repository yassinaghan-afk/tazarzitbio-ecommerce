import { type NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";

import { isAdminRequest } from "@/lib/admin/auth";
import type { Promotion, PromotionType } from "@/lib/admin/cms-types";
import { logAudit } from "@/lib/server/audit";
import { readStore, updateStore } from "@/lib/server/store";

const TYPES: PromotionType[] = ["percentage", "fixed", "free-shipping"];

function sanitize(input: Partial<Promotion>): Promotion | null {
  const code = (input.code ?? "").toString().trim().toUpperCase().replace(/\s+/g, "");
  if (!code) return null;
  const type = TYPES.includes(input.type as PromotionType)
    ? (input.type as PromotionType)
    : "percentage";
  let value = Math.max(0, Number(input.value) || 0);
  if (type === "percentage") value = Math.min(100, value);
  return {
    id: (input.id ?? "").toString() || `promo-${crypto.randomUUID().slice(0, 8)}`,
    code,
    type,
    value,
    minSubtotal: Math.max(0, Number(input.minSubtotal) || 0),
    startsAt: (input.startsAt ?? "").toString(),
    endsAt: (input.endsAt ?? "").toString(),
    usageLimit: Math.max(0, Math.round(Number(input.usageLimit) || 0)),
    usedCount: Math.max(0, Math.round(Number(input.usedCount) || 0)),
    isActive: input.isActive !== false,
    createdAt: (input.createdAt ?? new Date().toISOString()).toString(),
  };
}

export async function GET(req: NextRequest) {
  if (!(await isAdminRequest(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const store = await readStore();
  return NextResponse.json({ promotions: store.promotions });
}

export async function POST(req: NextRequest) {
  if (!(await isAdminRequest(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  let body: Partial<Promotion>;
  try {
    body = (await req.json()) as Partial<Promotion>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const record = sanitize(body);
  if (!record) {
    return NextResponse.json({ error: "Coupon code is required" }, { status: 400 });
  }
  const current = await readStore();
  const duplicate = current.promotions.some(
    (p) => p.code === record.code && p.id !== record.id,
  );
  if (duplicate) {
    return NextResponse.json(
      { error: `Coupon code "${record.code}" already exists` },
      { status: 409 },
    );
  }
  const store = await updateStore((prev) => {
    const exists = prev.promotions.some((p) => p.id === record.id);
    return {
      ...prev,
      promotions: exists
        ? prev.promotions.map((p) => (p.id === record.id ? record : p))
        : [record, ...prev.promotions],
    };
  });
  void logAudit(`Promotion "${record.code}" saved`, "promotion", record.id);
  return NextResponse.json({ promotions: store.promotions });
}

export async function DELETE(req: NextRequest) {
  if (!(await isAdminRequest(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const store = await updateStore((prev) => ({
    ...prev,
    promotions: prev.promotions.filter((p) => p.id !== id),
  }));
  void logAudit("Promotion deleted", "promotion", id);
  return NextResponse.json({ promotions: store.promotions });
}
