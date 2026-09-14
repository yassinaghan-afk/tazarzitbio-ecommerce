import { NextResponse } from "next/server";
import crypto from "node:crypto";

import type { CreateOrderInput, CreateOrderResponse, OrderRecord } from "@/lib/orders/types";
import {
  notifyOrderCreated,
  purchaseEventId,
} from "@/lib/orders/finalize-export";
import { resolveAmlouRoyalShippingFromLines } from "@/lib/products/amlou-royal";
import { readStore, updateStore } from "@/lib/server/store";
import { recordCouponUsage, validateCoupon } from "@/lib/server/promotions";
import { calculateShipping } from "@/lib/shipping/calculate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function safeText(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

function isFiniteNumber(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v);
}

interface OrderBody extends CreateOrderInput {
  /** Browser Meta cookies for CAPI matching (used later at finalize) */
  meta?: {
    fbp?: string;
    fbc?: string;
    eventSourceUrl?: string;
  };
}

/**
 * Creates the order, then instantly alerts Telegram + Google Sheets.
 * Meta Purchase (Pixel + CAPI) waits until the thank-you page.
 */
export async function POST(req: Request) {
  let input: OrderBody | null = null;
  try {
    input = (await req.json()) as OrderBody;
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
  const royalShipping = resolveAmlouRoyalShippingFromLines(
    products,
    store.shippingSettings?.defaultShippingPrice,
  );
  if (royalShipping !== null) {
    shippingPrice = royalShipping;
  }
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
  const upsellToken = crypto.randomBytes(24).toString("hex");

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
    upsellToken,
    upsellCompleted: false,
    sheetsExported: false,
    telegramNotified: false,
    metaPurchaseSent: false,
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

  // Instant ops alerts — never block checkout if Sheets/Telegram fail.
  let notifiedOrder = order;
  try {
    const notified = await notifyOrderCreated(order);
    notifiedOrder = notified.order;
  } catch (err) {
    console.error("order notify error", {
      orderId: order.orderId,
      message: err instanceof Error ? err.message : String(err),
    });
  }

  // Stable event id for thank-you Pixel + CAPI. Not fired here.
  const eventId = purchaseEventId(notifiedOrder.orderId);

  const res: CreateOrderResponse & {
    meta?: { purchaseEventId: string; upsellToken?: string };
  } = {
    order: notifiedOrder,
    meta: { purchaseEventId: eventId, upsellToken },
  };
  return NextResponse.json(res);
}
