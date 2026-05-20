import { type NextRequest, NextResponse } from "next/server";

import { isAdminRequest } from "@/lib/admin/auth";
import type { AdminProductData } from "@/lib/admin/types";
import { readStore, updateStore } from "@/lib/server/store";

export async function GET(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const store = await readStore();
  return NextResponse.json({ productOverrides: store.productOverrides });
}

export async function POST(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = (await req.json()) as AdminProductData;
  if (!body.id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }
  const store = await updateStore((prev) => {
    const exists = prev.productOverrides.find((p) => p.id === body.id);
    const productOverrides = exists
      ? prev.productOverrides.map((p) => (p.id === body.id ? { ...p, ...body } : p))
      : [...prev.productOverrides, body];
    return { ...prev, productOverrides };
  });
  return NextResponse.json({ productOverrides: store.productOverrides });
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
    productOverrides: prev.productOverrides.filter((p) => p.id !== id),
  }));
  return NextResponse.json({ productOverrides: store.productOverrides });
}
