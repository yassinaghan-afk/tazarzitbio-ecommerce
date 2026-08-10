import { NextResponse } from "next/server";

import type { CreateOrderInput, CreateOrderResponse } from "@/lib/orders/types";
import type { OrderRecord } from "@/lib/orders/types";
import { sendOrderToGoogleSheet } from "@/lib/google-sheets";
import { sendOrderTelegramNotification } from "@/lib/telegram";
import { readStore, updateStore } from "@/lib/server/store";
import { recordCouponUsage, validateCoupon } from "@/lib/server/promotions";
import { calculateShipping } from "@/lib/shipping/calculate";
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
  const city = safeText(input?.city);
  const customerNote = safeText(input?.customerNote);
  const couponCode = safeText(input?.couponCode);
  const products = Array.isArray(input?.products) ? input.products : [];
  const subtotal = input?.subtotal;

  if (!customerName || !phone || !address || products.length === 0) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  if (
    !isFiniteNumber(subtotal) ||
    !isFiniteNumber(input?.shippingPrice) ||
    !isFiniteNumber(input?.total)
  ) {
    return NextResponse.json({ error: "Invalid totals" }, { status: 400 });
  }

  // Recompute shipping and coupon discount server-side using stored settings
  // so admin-configured rules are always the source of truth.
  const store = await readStore();
  const bundleFlagBySlug = new Map(
    store.cmsProducts.map((p) => [p.slug, p.bundleFreeShipping !== false]),
  );
  const lines = products.map((p) => ({
    quantity: p.quantity,
    isBundle: p.isBundle,
    freeShipping: p.isBundle ? (bundleFlagBySlug.get(p.slug) ?? true) : undefined,
  }));
  const shipping = calculateShipping(lines, subtotal, store.shippingSettings);

  let discount = 0;
  let appliedCoupon = "";
  let shippingPrice = shipping.shippingFee;
  if (couponCode) {
    const coupon = await validateCoupon(couponCode, subtotal);
    if (coupon.valid) {
      appliedCoupon = coupon.code ?? couponCode;
      discount = coupon.discount ?? 0;
      if (coupon.freeShipping) shippingPrice = 0;
    }
  }

  const total = Math.max(0, subtotal - discount + shippingPrice);

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
    ...(city ? { city } : {}),
    products,
    subtotal,
    shippingPrice,
    ...(discount > 0 ? { discount } : {}),
    ...(appliedCoupon ? { couponCode: appliedCoupon } : {}),
    total,
    paymentMethod: "COD",
    orderStatus: "pending",
    ...(customerNote ? { customerNote } : {}),
    source: req.headers.get("referer") ?? "",
    createdAt,
  };

  await updateStore((prev) => ({
    ...prev,
    orders: [order, ...prev.orders],
  }));

  if (appliedCoupon) {
    try {
      await recordCouponUsage(appliedCoupon);
    } catch (err) {
      console.error("coupon usage error", err);
    }
  }

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

  try {
    await sendOrderTelegramNotification(order);
  } catch (err) {
    console.error("Telegram notification error", {
      orderId: order.orderId,
      message: err instanceof Error ? err.message : String(err),
    });
  }

  const res: CreateOrderResponse = { order };
  return NextResponse.json(res);
}
