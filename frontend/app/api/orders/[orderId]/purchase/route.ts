import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";

import {
  purchaseEventId,
  requestExportMeta,
  sendMetaPurchaseForOrder,
} from "@/lib/orders/finalize-export";
import { readStore } from "@/lib/server/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ orderId: string }> };

function safeTokenEqual(a: string, b: string): boolean {
  try {
    const ba = Buffer.from(a);
    const bb = Buffer.from(b);
    if (ba.length !== bb.length) return false;
    return timingSafeEqual(ba, bb);
  } catch {
    return false;
  }
}

/**
 * Meta CAPI Purchase — called from thank-you only (Pixel fires in the browser).
 * Requires the order upsellToken so random clients cannot spoof purchases.
 */
export async function POST(req: Request, context: RouteContext) {
  const { orderId } = await context.params;
  if (!orderId) {
    return NextResponse.json({ error: "Missing order id" }, { status: 400 });
  }

  let body: {
    token?: string;
    meta?: { fbp?: string; fbc?: string; eventSourceUrl?: string };
  };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const token = typeof body.token === "string" ? body.token.trim() : "";
  if (!token) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const store = await readStore();
  const existing = store.orders.find((o) => o.orderId === orderId);
  if (!existing) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }
  if (!existing.upsellToken || !safeTokenEqual(token, existing.upsellToken)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const result = await sendMetaPurchaseForOrder(
    existing,
    requestExportMeta(req, body.meta),
  );

  return NextResponse.json({
    ok: result.ok,
    skipped: result.skipped ?? false,
    meta: { purchaseEventId: result.purchaseEventId || purchaseEventId(orderId) },
  });
}
