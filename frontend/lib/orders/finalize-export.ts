import crypto from "node:crypto";

import { sendOrderToGoogleSheet } from "@/lib/google-sheets";
import { sendMetaCapiEvent } from "@/lib/meta/capi";
import { isMetaCapiConfigured } from "@/lib/meta/env";
import type { OrderRecord } from "@/lib/orders/types";
import { updateStore } from "@/lib/server/store";
import { sendOrderTelegramNotification } from "@/lib/telegram";
import { TRACKING_CURRENCY } from "@/lib/tracking/types";

export function purchaseEventId(orderId: string): string {
  const safe = orderId.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 40);
  return `purchase_${safe || crypto.randomUUID().slice(0, 12)}`;
}

export type FinalizeExportMeta = {
  fbp?: string;
  fbc?: string;
  eventSourceUrl?: string;
  clientIp?: string;
  clientUserAgent?: string;
};

export type NotifyOrderResult = {
  order: OrderRecord;
  /** True when Sheets export succeeded (or was already done / not configured). */
  ok: boolean;
};

export type MetaPurchaseResult = {
  order: OrderRecord;
  ok: boolean;
  purchaseEventId: string;
  skipped?: boolean;
};

async function patchOrderFlags(
  orderId: string,
  patch: Partial<OrderRecord>,
): Promise<OrderRecord | null> {
  const marked = await updateStore((prev) => ({
    ...prev,
    orders: prev.orders.map((o) =>
      o.orderId === orderId ? { ...o, ...patch } : o,
    ),
  }));
  return marked.orders.find((o) => o.orderId === orderId) ?? null;
}

/**
 * Instant ops alerts right after checkout confirm.
 * Google Sheets + Telegram only — never Meta Purchase.
 * Idempotent per channel. Checkout must not fail if either channel is down.
 */
export async function notifyOrderCreated(
  order: OrderRecord,
): Promise<NotifyOrderResult> {
  let current = order;
  let sheetsOk = Boolean(current.sheetsExported);

  if (!current.sheetsExported) {
    const sourcePage = (current.source ?? "").trim();
    sheetsOk = await sendOrderToGoogleSheet(current, { sourcePage });
    if (sheetsOk) {
      const updated = await patchOrderFlags(current.orderId, {
        sheetsExported: true,
        sheetsExportedAt: new Date().toISOString(),
      });
      if (updated) current = updated;
      else {
        current = {
          ...current,
          sheetsExported: true,
          sheetsExportedAt: new Date().toISOString(),
        };
      }
    }
  }

  if (!current.telegramNotified) {
    try {
      await sendOrderTelegramNotification(current);
      const updated = await patchOrderFlags(current.orderId, {
        telegramNotified: true,
        telegramNotifiedAt: new Date().toISOString(),
      });
      if (updated) current = updated;
      else current = { ...current, telegramNotified: true };
    } catch (err) {
      console.error("Telegram notification error", {
        orderId: current.orderId,
        message: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return { order: current, ok: sheetsOk };
}

/**
 * After upsell skip/complete: retry any missing Sheets/Telegram alerts.
 * If the customer added upsell lines, send an updated Telegram + append
 * those lines to Sheets (base order was already exported at create).
 * Never sends Meta Purchase.
 */
export async function finalizeUpsellAlerts(
  order: OrderRecord,
): Promise<NotifyOrderResult> {
  const base = await notifyOrderCreated(order);
  const current = base.order;

  const upsellLines = current.products.filter((p) => p.isUpsell);
  if (upsellLines.length === 0) {
    return { order: current, ok: true };
  }

  // Append only new upsell rows when base export already happened.
  if (current.sheetsExported) {
    try {
      await sendOrderToGoogleSheet(
        { ...current, products: upsellLines },
        { sourcePage: (current.source ?? "").trim() },
      );
    } catch (err) {
      console.error("Google Sheets upsell append error", {
        orderId: current.orderId,
        message: err instanceof Error ? err.message : String(err),
      });
    }
  }

  try {
    await sendOrderTelegramNotification(current);
  } catch (err) {
    console.error("Telegram upsell update error", {
      orderId: current.orderId,
      message: err instanceof Error ? err.message : String(err),
    });
  }

  return { order: current, ok: true };
}

/**
 * Meta CAPI Purchase — only from thank-you (idempotent).
 */
export async function sendMetaPurchaseForOrder(
  order: OrderRecord,
  meta?: FinalizeExportMeta,
): Promise<MetaPurchaseResult> {
  const eventId = purchaseEventId(order.orderId);

  if (order.metaPurchaseSent) {
    return { order, ok: true, purchaseEventId: eventId, skipped: true };
  }

  if (!isMetaCapiConfigured()) {
    const updated = await patchOrderFlags(order.orderId, {
      metaPurchaseSent: true,
      metaPurchaseSentAt: new Date().toISOString(),
    });
    return {
      order: updated ?? { ...order, metaPurchaseSent: true },
      ok: true,
      purchaseEventId: eventId,
      skipped: true,
    };
  }

  const sourcePage = (order.source ?? meta?.eventSourceUrl ?? "").trim();

  try {
    await sendMetaCapiEvent({
      eventName: "Purchase",
      eventId,
      eventSourceUrl: meta?.eventSourceUrl || sourcePage || undefined,
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
        clientIp: meta?.clientIp || "",
        clientUserAgent: meta?.clientUserAgent || "",
        fbp: meta?.fbp || undefined,
        fbc: meta?.fbc || undefined,
        externalId: order.phone,
      },
    });
  } catch (err) {
    console.error("Meta CAPI purchase error", {
      orderId: order.orderId,
      message: err instanceof Error ? err.message : String(err),
    });
    return { order, ok: false, purchaseEventId: eventId };
  }

  const updated = await patchOrderFlags(order.orderId, {
    metaPurchaseSent: true,
    metaPurchaseSentAt: new Date().toISOString(),
  });

  return {
    order: updated ?? { ...order, metaPurchaseSent: true },
    ok: true,
    purchaseEventId: eventId,
  };
}

/** @deprecated Use notifyOrderCreated / finalizeUpsellAlerts / sendMetaPurchaseForOrder */
export async function exportFinalizedOrder(
  order: OrderRecord,
): Promise<{ order: OrderRecord; ok: boolean; purchaseEventId: string }> {
  const notified = await finalizeUpsellAlerts(order);
  return {
    order: notified.order,
    ok: notified.ok,
    purchaseEventId: purchaseEventId(order.orderId),
  };
}

export function requestExportMeta(
  req: Request,
  bodyMeta?: { fbp?: string; fbc?: string; eventSourceUrl?: string },
): FinalizeExportMeta {
  const fwd = req.headers.get("x-forwarded-for");
  const clientIp =
    fwd?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "";
  return {
    fbp: typeof bodyMeta?.fbp === "string" ? bodyMeta.fbp.trim() : undefined,
    fbc: typeof bodyMeta?.fbc === "string" ? bodyMeta.fbc.trim() : undefined,
    eventSourceUrl:
      typeof bodyMeta?.eventSourceUrl === "string"
        ? bodyMeta.eventSourceUrl.trim()
        : undefined,
    clientIp,
    clientUserAgent: req.headers.get("user-agent") || "",
  };
}
