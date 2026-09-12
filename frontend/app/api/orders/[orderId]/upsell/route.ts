import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";

import type {
  OrderRecord,
  UpsellItemInput,
  UpsellOrderResponse,
} from "@/lib/orders/types";
import {
  exportFinalizedOrder,
  purchaseEventId,
  requestExportMeta,
} from "@/lib/orders/finalize-export";
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
  return order;
}

async function respondFinalize(
  order: OrderRecord,
  req: Request,
  bodyMeta?: { fbp?: string; fbc?: string; eventSourceUrl?: string },
) {
  const exported = await exportFinalizedOrder(
    order,
    requestExportMeta(req, bodyMeta),
  );
  const payload: UpsellOrderResponse = {
    order: sanitizeOrderForClient(exported.order),
    upsellCompleted: true,
    exportOk: exported.ok,
    meta: { purchaseEventId: exported.purchaseEventId },
  };
  if (!exported.ok) {
    return NextResponse.json(
      { ...payload, error: "export_failed" },
      { status: 502 },
    );
  }
  return NextResponse.json(payload);
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
    meta?: { fbp?: string; fbc?: string; eventSourceUrl?: string };
  };
  try {
    body = (await req.json()) as typeof body;
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

  // Idempotent finalize / Sheets retry
  if (existing.upsellCompleted) {
    if (existing.sheetsExported) {
      return NextResponse.json({
        order: sanitizeOrderForClient(existing),
        upsellCompleted: true,
        exportOk: true,
        meta: { purchaseEventId: purchaseEventId(existing.orderId) },
      } satisfies UpsellOrderResponse);
    }
    return respondFinalize(existing, req, body.meta);
  }

  // Skip: keep original lines, finalize + export
  if (action === "skip") {
    const updated = await updateStore((prev) => {
      const orders = prev.orders.map((o) =>
        o.orderId === orderId ? { ...o, upsellCompleted: true } : o,
      );
      return { ...prev, orders };
    });
    const order = updated.orders.find((o) => o.orderId === orderId)!;
    return respondFinalize(order, req, body.meta);
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

  if (action === "sync") {
    return NextResponse.json({
      order: sanitizeOrderForClient(order),
      upsellCompleted: false,
    } satisfies UpsellOrderResponse);
  }

  return respondFinalize(order, req, body.meta);
}
