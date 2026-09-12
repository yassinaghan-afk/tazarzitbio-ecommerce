import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";

import type {
  OrderRecord,
  UpsellItemInput,
  UpsellOrderResponse,
} from "@/lib/orders/types";
import {
  buildUpsellLine,
  recomputeOrderTotals,
  splitOrderProducts,
} from "@/lib/orders/upsell";
import { readStore, updateStore } from "@/lib/server/store";

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

function sanitizeOrderForClient(order: OrderRecord): OrderRecord {
  // Token stays in response only when caller already proved possession via request body.
  return order;
}

export async function POST(req: Request, context: RouteContext) {
  const { orderId } = await context.params;
  if (!orderId) {
    return NextResponse.json({ error: "Missing order id" }, { status: 400 });
  }

  let body: {
    token?: string;
    action?: "sync" | "complete" | "skip";
    items?: UpsellItemInput[];
  };
  try {
    body = (await req.json()) as {
      token?: string;
      action?: "sync" | "complete" | "skip";
      items?: UpsellItemInput[];
    };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const token = typeof body.token === "string" ? body.token.trim() : "";
  const action = body.action;
  if (!token || (action !== "sync" && action !== "complete" && action !== "skip")) {
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
  if (existing.upsellCompleted) {
    const res: UpsellOrderResponse = {
      order: sanitizeOrderForClient(existing),
      upsellCompleted: true,
    };
    return NextResponse.json(res);
  }

  // Skip / complete without changing lines
  if (action === "skip" || (action === "complete" && !Array.isArray(body.items))) {
    const updated = await updateStore((prev) => {
      const orders = prev.orders.map((o) =>
        o.orderId === orderId
          ? { ...o, upsellCompleted: true }
          : o,
      );
      return { ...prev, orders };
    });
    const order = updated.orders.find((o) => o.orderId === orderId)!;
    return NextResponse.json({
      order: sanitizeOrderForClient(order),
      upsellCompleted: true,
    } satisfies UpsellOrderResponse);
  }

  // sync or complete-with-items: replace upsell lines idempotently
  const rawItems = Array.isArray(body.items) ? body.items : [];
  const { original } = splitOrderProducts(existing.products);
  const originalIds = new Set(original.map((p) => p.productId));

  // Dedupe by productId — last quantity wins
  const byProduct = new Map<string, UpsellItemInput>();
  for (const item of rawItems) {
    const productId = typeof item?.productId === "string" ? item.productId.trim() : "";
    if (!productId) continue;
    byProduct.set(productId, {
      productId,
      offerId: typeof item.offerId === "string" ? item.offerId : undefined,
      quantity: typeof item.quantity === "number" ? item.quantity : 1,
    });
  }

  const upsellLines: OrderRecord["products"] = [];
  for (const item of byProduct.values()) {
    const built = await buildUpsellLine({
      productId: item.productId,
      offerId: item.offerId,
      quantity: item.quantity,
      excludeProductIds: originalIds,
    });
    if ("error" in built) {
      return NextResponse.json(
        { error: built.error, productId: item.productId },
        { status: 400 },
      );
    }
    upsellLines.push(built);
  }

  // CRITICAL: keep the original single shipping fee — never add a second charge.
  const nextBase: OrderRecord = {
    ...existing,
    products: [...original, ...upsellLines],
    shippingPrice: existing.shippingPrice,
    upsellCompleted: action === "complete",
  };
  const next = recomputeOrderTotals(nextBase);

  const updated = await updateStore((prev) => ({
    ...prev,
    orders: prev.orders.map((o) => (o.orderId === orderId ? next : o)),
  }));
  const order = updated.orders.find((o) => o.orderId === orderId)!;

  return NextResponse.json({
    order: sanitizeOrderForClient(order),
    upsellCompleted: Boolean(order.upsellCompleted),
  } satisfies UpsellOrderResponse);
}
