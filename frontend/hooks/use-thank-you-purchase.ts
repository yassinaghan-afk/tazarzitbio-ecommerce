"use client";

import { useEffect, useRef } from "react";

import type { PlacedOrder } from "@/lib/checkout/types";
import { getMetaBrowserIds } from "@/lib/meta/browser";
import { purchaseEventId } from "@/lib/orders/purchase-event-id";
import { trackPurchase } from "@/lib/tracking/events";

/**
 * Fires browser Purchase + server Meta CAPI once the customer reaches thank-you.
 * Idempotent across refresh (sessionStorage + server metaPurchaseSent).
 */
export function useThankYouPurchase(order: PlacedOrder | null) {
  const started = useRef(false);

  useEffect(() => {
    if (!order?.id || started.current) return;
    started.current = true;

    const eventId = purchaseEventId(order.id);

    trackPurchase({
      orderId: order.id,
      products: order.items.map((i) => ({
        productId: i.productId || i.slug || i.nameAr,
        slug: i.slug || "",
        name: i.nameAr,
        price: i.unitPrice,
        quantity: i.quantity,
      })),
      subtotal: order.subtotal,
      shipping: order.shippingFee,
      total: order.total,
      eventId,
    });

    if (!order.upsellToken) return;

    const metaIds = getMetaBrowserIds();
    void fetch(`/api/orders/${encodeURIComponent(order.id)}/purchase`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token: order.upsellToken,
        meta: {
          ...(metaIds.fbp ? { fbp: metaIds.fbp } : {}),
          ...(metaIds.fbc ? { fbc: metaIds.fbc } : {}),
          eventSourceUrl:
            typeof window !== "undefined" ? window.location.href : undefined,
        },
      }),
      keepalive: true,
    }).catch(() => {
      /* never block thank-you UI */
    });
  }, [order]);
}
