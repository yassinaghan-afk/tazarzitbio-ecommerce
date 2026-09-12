
import crypto from "node:crypto";

import type { DeliveryStatus } from "@/lib/admin/ops-types";
import { getDeliveryProvider } from "@/lib/delivery/registry";
import {
  DEFAULT_DELIVERY_STATE,
  normalizeDeliveryState,
  type DeliveryIntegrationLog,
  type DeliveryProviderId,
  type DeliveryStatusHistoryEntry,
  type OrderShipment,
} from "@/lib/delivery/types";
import { logAudit } from "@/lib/server/audit";
import { readStore, updateStore } from "@/lib/server/store";

const MAX_LOGS = 300;
const MAX_WEBHOOK_IDS = 500;

export async function appendDeliveryLog(
  entry: Omit<DeliveryIntegrationLog, "id" | "at"> & { at?: string },
): Promise<void> {
  const log: DeliveryIntegrationLog = {
    id: crypto.randomUUID().slice(0, 10),
    at: entry.at ?? new Date().toISOString(),
    providerId: entry.providerId,
    requestType: entry.requestType,
    orderId: entry.orderId,
    externalShipmentId: entry.externalShipmentId,
    success: entry.success,
    errorCode: entry.errorCode,
    message: entry.message,
  };
  await updateStore((prev) => ({
    ...prev,
    delivery: {
      ...normalizeDeliveryState(prev.delivery),
      integrationLogs: [log, ...(prev.delivery?.integrationLogs ?? [])].slice(
        0,
        MAX_LOGS,
      ),
    },
  }));
}

function historyEntry(partial: Omit<DeliveryStatusHistoryEntry, "id" | "at"> & { at?: string }): DeliveryStatusHistoryEntry {
  return {
    id: crypto.randomUUID().slice(0, 8),
    at: partial.at ?? new Date().toISOString(),
    providerId: partial.providerId,
    externalStatus: partial.externalStatus,
    internalStatus: partial.internalStatus,
    rawEventId: partial.rawEventId,
    note: partial.note,
    source: partial.source,
  };
}

/**
 * Controlled send-to-courier action.
 * Does not invent Elite HTTP calls — provider returns API_DOCS_REQUIRED until wired.
 */
export async function sendOrderToDelivery(
  orderId: string,
  providerId: DeliveryProviderId = "elite",
  actor?: { userId: string; userName: string },
) {
  const provider = getDeliveryProvider(providerId);
  if (!provider) {
    return {
      ok: false as const,
      errorCode: "UNKNOWN_PROVIDER",
      errorMessage: "مزود التوصيل غير معروف",
    };
  }

  const store = await readStore();
  const order = store.orders.find((o) => o.orderId === orderId);
  if (!order) {
    return {
      ok: false as const,
      errorCode: "ORDER_NOT_FOUND",
      errorMessage: "الطلب غير موجود",
    };
  }

  const idempotencyKey =
    order.shipment?.idempotencyKey || `ship_${orderId}_${providerId}`;

  const result = await provider.createShipment({ orderId, idempotencyKey });

  await appendDeliveryLog({
    providerId,
    requestType: "create_shipment",
    orderId,
    externalShipmentId: result.shipment?.externalShipmentId,
    success: result.ok,
    errorCode: result.errorCode,
    message: result.errorMessage,
  });

  if (!result.ok || !result.shipment) {
    return result;
  }

  const shipment: OrderShipment = {
    ...result.shipment,
    providerId,
    idempotencyKey,
    customerShippingCharge: order.shippingPrice,
    createdAt: result.shipment.createdAt ?? new Date().toISOString(),
    lastSyncAt: new Date().toISOString(),
  };

  await updateStore((prev) => ({
    ...prev,
    orders: prev.orders.map((o) => {
      if (o.orderId !== orderId) return o;
      const deliveryHistory = [
        historyEntry({
          providerId,
          externalStatus: shipment.externalStatus,
          internalStatus: shipment.internalStatus,
          source: "api",
          note: result.alreadyExists ? "Existing shipment reused" : "Shipment create requested",
        }),
        ...(o.deliveryHistory ?? []),
      ].slice(0, 100);
      const timeline = [
        {
          id: crypto.randomUUID().slice(0, 8),
          action: result.alreadyExists
            ? "Delivery shipment already exists"
            : "Sent to delivery company",
          userId: actor?.userId,
          userName: actor?.userName,
          note: shipment.trackingNumber,
          at: new Date().toISOString(),
        },
        ...(o.timeline ?? []),
      ].slice(0, 100);
      return {
        ...o,
        shipment,
        deliveryHistory,
        timeline,
        deliveryStatus: shipment.internalStatus ?? o.deliveryStatus,
        updatedAt: new Date().toISOString(),
      };
    }),
  }));

  void logAudit(
    result.alreadyExists
      ? `Delivery shipment exists ${orderId}`
      : `Delivery send ${orderId}`,
    "delivery",
    orderId,
  );

  return { ...result, shipment };
}

export async function refreshOrderDelivery(
  orderId: string,
  providerId: DeliveryProviderId = "elite",
) {
  const provider = getDeliveryProvider(providerId);
  if (!provider) {
    return {
      ok: false as const,
      errorCode: "UNKNOWN_PROVIDER",
      errorMessage: "مزود التوصيل غير معروف",
    };
  }

  const result = await provider.refreshShipment(orderId);
  await appendDeliveryLog({
    providerId,
    requestType: "refresh_shipment",
    orderId,
    externalShipmentId: result.shipment?.externalShipmentId,
    success: result.ok,
    errorCode: result.errorCode,
    message: result.errorMessage,
  });

  if (!result.ok || !result.shipment) return result;

  const nextShipment: OrderShipment = {
    ...result.shipment,
    providerId,
    lastSyncAt: new Date().toISOString(),
  };

  await updateStore((prev) => ({
    ...prev,
    orders: prev.orders.map((o) => {
      if (o.orderId !== orderId) return o;
      const deliveryHistory = [
        historyEntry({
          providerId,
          externalStatus: nextShipment.externalStatus,
          internalStatus: nextShipment.internalStatus,
          source: "api",
          note: "Status refresh",
        }),
        ...(o.deliveryHistory ?? []),
      ].slice(0, 100);
      return {
        ...o,
        shipment: nextShipment,
        deliveryHistory,
        deliveryStatus: nextShipment.internalStatus ?? o.deliveryStatus,
        updatedAt: new Date().toISOString(),
      };
    }),
  }));

  return { ...result, shipment: nextShipment };
}

export async function rememberWebhookEventId(eventId: string): Promise<boolean> {
  const store = await readStore();
  const ids = store.delivery?.processedWebhookEventIds ?? [];
  if (ids.includes(eventId)) return false;
  await updateStore((prev) => ({
    ...prev,
    delivery: {
      ...normalizeDeliveryState(prev.delivery),
      processedWebhookEventIds: [eventId, ...ids].slice(0, MAX_WEBHOOK_IDS),
    },
  }));
  return true;
}

export function computeDeliveryOverview(
  orders: {
    deliveryStatus?: DeliveryStatus;
    shipment?: OrderShipment;
    createdAt: string;
  }[],
  range?: { from: Date; to: Date },
) {
  const inRange = (iso: string) => {
    if (!range) return true;
    const t = new Date(iso).getTime();
    return t >= range.from.getTime() && t <= range.to.getTime();
  };

  const withShip = orders.filter(
    (o) => o.shipment?.providerId && inRange(o.shipment.createdAt || o.createdAt),
  );

  const count = (status: DeliveryStatus) =>
    withShip.filter(
      (o) => (o.shipment?.internalStatus || o.deliveryStatus) === status,
    ).length;

  let codPending = 0;
  let codReceived = 0;
  let deliveryCosts = 0;

  for (const o of withShip) {
    const s = o.shipment!;
    if (typeof s.courierShippingCost === "number") {
      deliveryCosts += s.courierShippingCost;
    }
    if (s.payoutStatus === "paid") {
      codReceived += s.codReceived ?? s.codExpected ?? 0;
    } else if (s.payoutStatus === "partially_paid") {
      codReceived += s.codReceived ?? 0;
      codPending += Math.max(0, (s.codExpected ?? 0) - (s.codReceived ?? 0));
    } else {
      codPending += s.codExpected ?? 0;
    }
  }

  return {
    totalShipments: withShip.length,
    pending: count("preparing") + count("confirmed") + count("new") + count("pending_confirmation"),
    inTransit: count("shipped") + count("in_transit"),
    delivered: count("delivered"),
    returned: count("returned"),
    failed: count("failed_delivery") + count("refused") + count("cancelled"),
    codPending,
    codReceived,
    deliveryCosts,
  };
}
