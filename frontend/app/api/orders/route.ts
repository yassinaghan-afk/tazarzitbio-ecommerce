import { NextResponse } from "next/server";

import type { CreateOrderInput, CreateOrderResponse } from "@/lib/orders/types";
import type { OrderRecord } from "@/lib/orders/types";
import { sendOrderToGoogleSheet } from "@/lib/google-sheets";
import { updateStore } from "@/lib/server/store";
import crypto from "node:crypto";

function safeText(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

function isFiniteNumber(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v);
}

export async function POST(req: Request) {
  let input: CreateOrderInput | null = null;
  try {
    input = (await req.json()) as CreateOrderInput;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const customerName = safeText(input?.customerName);
  const phone = safeText(input?.phone);
  const address = safeText(input?.address);
  const products = Array.isArray(input?.products) ? input.products : [];
  const subtotal = input?.subtotal;
  const shippingPrice = input?.shippingPrice;
  const total = input?.total;

  if (!customerName || !phone || !address || products.length === 0) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  if (!isFiniteNumber(subtotal) || !isFiniteNumber(shippingPrice) || !isFiniteNumber(total)) {
    return NextResponse.json({ error: "Invalid totals" }, { status: 400 });
  }

  const createdAt = new Date().toISOString();
  const orderId = `TZ-${createdAt.replace(/[-:TZ.]/g, "").slice(0, 14)}-${crypto
    .randomUUID()
    .slice(0, 6)
    .toUpperCase()}`;

  const order: OrderRecord = {
    orderId,
    customerName,
    phone,
    address,
    products,
    subtotal,
    shippingPrice,
    total,
    paymentMethod: "COD",
    orderStatus: "pending",
    createdAt,
  };

  await updateStore((prev) => ({
    ...prev,
    orders: [order, ...prev.orders],
  }));

  // Await export so the serverless handler does not exit before fetch completes.
  // Errors are caught inside sendOrderToGoogleSheet — checkout still succeeds.
  const sourcePage = req.headers.get("referer") ?? "";
  try {
    await sendOrderToGoogleSheet(order, { sourcePage });
  } catch (err) {
    console.error("Google Sheets error", {
      orderId: order.orderId,
      message: err instanceof Error ? err.message : String(err),
    });
  }

  const res: CreateOrderResponse = { order };
  return NextResponse.json(res);
}

