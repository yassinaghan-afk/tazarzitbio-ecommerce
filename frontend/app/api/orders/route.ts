import { NextResponse } from "next/server";
import crypto from "node:crypto";

import type { CreateOrderInput, CreateOrderResponse, OrderRecord } from "@/lib/orders/types";
import { resolveAmlouRoyalShippingFromLines } from "@/lib/products/amlou-royal";
import { sendOrderToGoogleSheet } from "@/lib/google-sheets";
import { sendOrderTelegramNotification } from "@/lib/telegram";
import { sendMetaCapiEvent } from "@/lib/meta/capi";
import { isMetaCapiConfigured } from "@/lib/meta/env";
import { readStore, updateStore } from "@/lib/server/store";
import { recordCouponUsage, validateCoupon } from "@/lib/server/promotions";
import { calculateShipping } from "@/lib/shipping/calculate";
import { TRACKING_CURRENCY } from "@/lib/tracking/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function safeText(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

function isFiniteNumber(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v);
}

interface OrderBody extends CreateOrderInput {
  /** Browser Meta cookies for CAPI matching */
  meta?: {
    fbp?: string;
    fbc?: string;
    eventSourceUrl?: string;
  };
}

function purchaseEventId(orderId: string): string {
  // Stable event_id so retries/double-posts of the same order dedupe at Meta.
  const safe = orderId.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 40);
  return `purchase_${safe || crypto.randomUUID().slice(0, 12)}`;
}

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

  // Meta CAPI Purchase — only after order is persisted. Never block the order.
  const eventId = purchaseEventId(order.orderId);
  if (isMetaCapiConfigured()) {
    try {
      const fwd = req.headers.get("x-forwarded-for");
      const clientIp =
        fwd?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "";
      const clientUserAgent = req.headers.get("user-agent") || "";
      const eventSourceUrl =
        safeText(input?.meta?.eventSourceUrl) || sourcePage || undefined;

      await sendMetaCapiEvent({
        eventName: "Purchase",
        eventId,
        eventSourceUrl,
        customData: {
          value: order.total,
          currency: TRACKING_CURRENCY,
          content_ids: order.products.map((p) => p.productId),
          content_name: order.products.map((p) => p.nameAr).join(", "),
          content_type: "product",
          contents: order.products.map((p) => ({
            id: p.productId,
            quantity: p.quantity,
            item_price: p.unitPrice,
          })),
          num_items: order.products.reduce((s, p) => s + p.quantity, 0),
          order_id: order.orderId,
        },
        userData: {
          phone: order.phone,
          fullName: order.customerName,
          city: order.city,
          country: "ma",
          clientIp,
          clientUserAgent,
          fbp: safeText(input?.meta?.fbp) || undefined,
          fbc: safeText(input?.meta?.fbc) || undefined,
          externalId: order.phone,
        },
      });
    } catch (err) {
      console.error("Meta CAPI purchase error", {
        orderId: order.orderId,
        message: err instanceof Error ? err.message : String(err),
      });
    }
  }

  const res: CreateOrderResponse & {
    meta?: { purchaseEventId: string };
  } = {
    order,
    meta: { purchaseEventId: eventId },
  };
  return NextResponse.json(res);
}
