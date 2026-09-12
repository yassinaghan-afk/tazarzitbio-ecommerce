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

export type FinalizeExportResult = {
  order: OrderRecord;
  ok: boolean;
  purchaseEventId: string;
};

/**
 * Sends the FINAL order to Google Sheets once (idempotent), then best-effort
 * Telegram + Meta CAPI. Never creates a second Sheets export for the same orderId.
 */
export async function exportFinalizedOrder(
  order: OrderRecord,
  meta?: FinalizeExportMeta,
): Promise<FinalizeExportResult> {
  const eventId = purchaseEventId(order.orderId);

  if (order.sheetsExported) {
    return { order, ok: true, purchaseEventId: eventId };
  }

  const sourcePage = (order.source ?? meta?.eventSourceUrl ?? "").trim();
  const sheetsOk = await sendOrderToGoogleSheet(order, { sourcePage });
  if (!sheetsOk) {
    return { order, ok: false, purchaseEventId: eventId };
  }

  const marked = await updateStore((prev) => ({
    ...prev,
    orders: prev.orders.map((o) =>
      o.orderId === order.orderId
        ? {
            ...o,
            sheetsExported: true,
            sheetsExportedAt: new Date().toISOString(),
            upsellCompleted: true,
          }
        : o,
    ),
  }));
  const exported = marked.orders.find((o) => o.orderId === order.orderId) ?? {
    ...order,
    sheetsExported: true,
    upsellCompleted: true,
  };

  try {
    await sendOrderTelegramNotification(exported);
  } catch (err) {
    console.error("Telegram notification error", {
      orderId: exported.orderId,
      message: err instanceof Error ? err.message : String(err),
    });
  }

  if (isMetaCapiConfigured()) {
    try {
      await sendMetaCapiEvent({
        eventName: "Purchase",
        eventId,
        eventSourceUrl: meta?.eventSourceUrl || sourcePage || undefined,
        customData: {
          value: exported.total,
          currency: TRACKING_CURRENCY,
          content_ids: exported.products.map((p) => p.productId),
          content_name: exported.products.map((p) => p.nameAr).join(", "),
          content_type: "product",
          contents: exported.products.map((p) => ({
            id: p.productId,
            quantity: p.quantity,
            item_price: p.unitPrice,
          })),
          num_items: exported.products.reduce((s, p) => s + p.quantity, 0),
          order_id: exported.orderId,
        },
        userData: {
          phone: exported.phone,
          fullName: exported.customerName,
          city: exported.city,
          country: "ma",
          clientIp: meta?.clientIp || "",
          clientUserAgent: meta?.clientUserAgent || "",
          fbp: meta?.fbp || undefined,
          fbc: meta?.fbc || undefined,
          externalId: exported.phone,
        },
      });
    } catch (err) {
      console.error("Meta CAPI purchase error", {
        orderId: exported.orderId,
        message: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return { order: exported, ok: true, purchaseEventId: eventId };
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
