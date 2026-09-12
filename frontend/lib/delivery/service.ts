import crypto from "node:crypto";

import type { DeliveryStatus } from "@/lib/admin/ops-types";
import { resolveEliteStatusName } from "@/lib/delivery/elite/status-catalog";
import {
  DEFAULT_ELITE_STATUS_MAP,
  mapEliteStatusId,
} from "@/lib/delivery/elite/status-map";
import { getDeliveryProvider } from "@/lib/delivery/registry";
import { resolveEliteSecrets } from "@/lib/delivery/secrets";
import {
  normalizeDeliveryState,
  type DeliveryIntegrationLog,
  type DeliveryProviderId,
  type DeliveryStatusHistoryEntry,
  type EliteWebhookEvent,
  type EliteWebhookProcessStatus,
  type OrderShipment,
} from "@/lib/delivery/types";
import { logAudit } from "@/lib/server/audit";
import { readStore, updateStore } from "@/lib/server/store";

const MAX_LOGS = 300;
const MAX_WEBHOOK_IDS = 800;
const MAX_WEBHOOK_EVENTS = 400;
const STALE_SYNC_MS = 12 * 60 * 60 * 1000;

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
  await updateStore((prev) => {
    const delivery = normalizeDeliveryState(prev.delivery);
    return {
      ...prev,
      delivery: {
        ...delivery,
        integrationLogs: [log, ...delivery.integrationLogs].slice(0, MAX_LOGS),
      },
    };
  });
}

function historyEntry(
  partial: Omit<DeliveryStatusHistoryEntry, "id" | "at"> & { at?: string },
): DeliveryStatusHistoryEntry {
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

function webhookEventKey(payload: {
  package_id: string;
  notif_type: string;
  delivery_status: number | string;
  event_time?: string;
}): string {
  return `${payload.package_id}|${payload.notif_type}|${payload.delivery_status}|${payload.event_time ?? ""}`;
}

function parseEliteEventTime(eventTime?: string): string {
  if (!eventTime) return new Date().toISOString();
  const normalized = eventTime.includes("T")
    ? eventTime
    : eventTime.replace(" ", "T") + "+01:00";
  const d = new Date(normalized);
  return Number.isFinite(d.getTime()) ? d.toISOString() : new Date().toISOString();
}

function findOrderForElitePackage(
  orders: {
    orderId: string;
    total: number;
    orderStatus?: string;
    deliveryStatus?: DeliveryStatus;
    paymentCollectionStatus?: string;
    shipment?: OrderShipment;
    deliveryHistory?: DeliveryStatusHistoryEntry[];
  }[],
  packageId: string,
  internalId?: string,
) {
  const byPackage = orders.find(
    (o) =>
      o.shipment?.providerId === "elite" &&
      (o.shipment.externalShipmentId === packageId ||
        o.shipment.trackingNumber === packageId),
  );
  if (byPackage) return byPackage;

  if (internalId) {
    const byInternal = orders.find(
      (o) =>
        o.orderId === internalId ||
        (o.shipment?.providerId === "elite" &&
          o.shipment.internalId === internalId),
    );
    if (byInternal) return byInternal;
  }
  return undefined;
}

function deriveOrderStatus(
  current: string | undefined,
  internalStatus: DeliveryStatus | undefined,
): string | undefined {
  if (!internalStatus) return current;
  if (internalStatus === "delivered") return "delivered";
  if (internalStatus === "returned") return "returned";
  if (internalStatus === "cancelled") return "cancelled";
  if (
    (internalStatus === "shipped" || internalStatus === "in_transit") &&
    (current === "confirmed" ||
      current === "preparing" ||
      current === "pending" ||
      current === "contacted")
  ) {
    return "shipped";
  }
  return current;
}

/**
 * Controlled send-to-courier action.
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

  const baseUrl =
    resolveEliteSecrets(store.delivery?.providers?.elite).baseUrl || undefined;
  const externalStatusName =
    result.shipment.externalStatusName ||
    (await resolveEliteStatusName(result.shipment.externalStatus, baseUrl));

  const now = new Date().toISOString();
  const shipment: OrderShipment = {
    ...result.shipment,
    providerId,
    idempotencyKey,
    internalId: order.orderId,
    customerShippingCharge: order.shippingPrice,
    externalStatusName,
    createdAt: result.shipment.createdAt ?? now,
    eliteLinkedAt: result.shipment.eliteLinkedAt ?? now,
    lastSyncAt: now,
    syncState: result.shipment.externalShipmentId ? "synced" : "error",
    elitePaymentStatus: result.shipment.elitePaymentStatus ?? "unknown",
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
          note: result.alreadyExists
            ? `Linked Elite package ${shipment.externalShipmentId}`
            : `Sent to Elite — package ${shipment.externalShipmentId}`,
        }),
        ...(o.deliveryHistory ?? []),
      ].slice(0, 100);
      const timeline = [
        {
          id: crypto.randomUUID().slice(0, 8),
          action: result.alreadyExists
            ? "Delivery shipment already exists"
            : "Sent to Elite Delivery",
          userId: actor?.userId,
          userName: actor?.userName,
          note: shipment.externalShipmentId || shipment.trackingNumber,
          at: now,
        },
        ...(o.timeline ?? []),
      ].slice(0, 100);
      return {
        ...o,
        shipment,
        deliveryHistory,
        timeline,
        deliveryStatus: shipment.internalStatus ?? o.deliveryStatus,
        orderStatus: deriveOrderStatus(
          o.orderStatus,
          shipment.internalStatus,
        ) as typeof o.orderStatus,
        updatedAt: now,
      };
    }),
  }));

  void logAudit(
    result.alreadyExists
      ? `Delivery shipment exists ${orderId}`
      : `Delivery send ${orderId} → ${shipment.externalShipmentId}`,
    "delivery",
    orderId,
  );

  return { ...result, shipment };
}

/**
 * Manual sync fallback.
 * Elite docs expose no package GET — refresh re-resolves status names from
 * GET /statuses, remaps internal status, and updates sync metadata.
 */
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

  const store = await readStore();
  const order = store.orders.find((o) => o.orderId === orderId);
  if (!order?.shipment?.externalShipmentId) {
    return {
      ok: false as const,
      errorCode: "NO_SHIPMENT",
      errorMessage: "لا توجد شحنة Elite مرتبطة بهذا الطلب",
    };
  }

  const result = await provider.refreshShipment(orderId);
  await appendDeliveryLog({
    providerId,
    requestType: "refresh_shipment",
    orderId,
    externalShipmentId:
      result.shipment?.externalShipmentId || order.shipment.externalShipmentId,
    success: result.ok,
    errorCode: result.errorCode,
    message: result.errorMessage,
  });

  if (!result.ok || !result.shipment) return result;

  const baseUrl =
    resolveEliteSecrets(store.delivery?.providers?.elite).baseUrl || undefined;
  const statusMap = {
    ...DEFAULT_ELITE_STATUS_MAP,
    ...(store.delivery?.providers?.elite?.config.statusMap ?? {}),
  };

  const externalStatus = result.shipment.externalStatus;
  const externalStatusName =
    (await resolveEliteStatusName(externalStatus, baseUrl)) ||
    result.shipment.externalStatusName;
  const internalStatus =
    (externalStatus != null
      ? mapEliteStatusId(externalStatus, statusMap)
      : null) ?? result.shipment.internalStatus;

  const now = new Date().toISOString();
  const nextShipment: OrderShipment = {
    ...result.shipment,
    providerId,
    internalId: result.shipment.internalId || order.orderId,
    externalStatus,
    externalStatusName,
    internalStatus: internalStatus ?? result.shipment.internalStatus,
    lastSyncAt: now,
    syncState: "synced",
    lastError: undefined,
  };

  await updateStore((prev) => ({
    ...prev,
    orders: prev.orders.map((o) => {
      if (o.orderId !== orderId) return o;
      const statusChanged =
        nextShipment.internalStatus !== o.shipment?.internalStatus ||
        nextShipment.externalStatus !== o.shipment?.externalStatus;
      const deliveryHistory = statusChanged
        ? [
            historyEntry({
              providerId,
              externalStatus: nextShipment.externalStatus,
              internalStatus: nextShipment.internalStatus,
              source: "api",
              note: "Manual Sync with Elite (status catalog remap)",
            }),
            ...(o.deliveryHistory ?? []),
          ].slice(0, 100)
        : o.deliveryHistory;
      return {
        ...o,
        shipment: nextShipment,
        deliveryHistory,
        deliveryStatus: nextShipment.internalStatus ?? o.deliveryStatus,
        orderStatus: deriveOrderStatus(
          o.orderStatus,
          nextShipment.internalStatus,
        ) as typeof o.orderStatus,
        updatedAt: now,
      };
    }),
  }));

  return {
    ...result,
    shipment: nextShipment,
    note:
      "Elite has no package status GET endpoint — remapped from cached Elite status IDs and last known delivery_status.",
  };
}

/**
 * Mark active Elite shipments without recent webhooks as delayed,
 * and re-resolve Elite status names from GET /statuses.
 */
export async function runEliteFallbackSync(limit = 40): Promise<{
  ok: true;
  scanned: number;
  updated: number;
  delayed: number;
}> {
  const store = await readStore();
  const baseUrl =
    resolveEliteSecrets(store.delivery?.providers?.elite).baseUrl || undefined;
  const statusMap = {
    ...DEFAULT_ELITE_STATUS_MAP,
    ...(store.delivery?.providers?.elite?.config.statusMap ?? {}),
  };

  const active = store.orders.filter((o) => {
    if (o.shipment?.providerId !== "elite" || !o.shipment.externalShipmentId) {
      return false;
    }
    const st = o.shipment.internalStatus || o.deliveryStatus;
    return (
      st !== "delivered" &&
      st !== "returned" &&
      st !== "cancelled" &&
      st !== "refused"
    );
  });

  let updated = 0;
  let delayed = 0;
  const now = Date.now();
  const targets = active.slice(0, limit);

  const patches = new Map<string, OrderShipment>();
  for (const o of targets) {
    const s = o.shipment!;
    const lastEvent = s.eliteLastEventAt || s.lastWebhookAt || s.lastSyncAt;
    const age = lastEvent ? now - new Date(lastEvent).getTime() : Infinity;
    const isDelayed = age > STALE_SYNC_MS;
    if (isDelayed) delayed += 1;

    const externalStatusName =
      (await resolveEliteStatusName(s.externalStatus, baseUrl)) ||
      s.externalStatusName;
    const internalStatus =
      (s.externalStatus != null
        ? mapEliteStatusId(s.externalStatus, statusMap)
        : null) ?? s.internalStatus;

    patches.set(o.orderId, {
      ...s,
      externalStatusName,
      internalStatus: internalStatus ?? s.internalStatus,
      syncState: isDelayed ? "delayed" : s.syncState === "error" ? "error" : "synced",
      lastSyncAt: new Date().toISOString(),
    });
  }

  if (patches.size > 0) {
    let count = 0;
    await updateStore((prev) => ({
      ...prev,
      orders: prev.orders.map((o) => {
        const next = patches.get(o.orderId);
        if (!next) return o;
        count += 1;
        return {
          ...o,
          shipment: next,
          deliveryStatus: next.internalStatus ?? o.deliveryStatus,
          updatedAt: new Date().toISOString(),
        };
      }),
    }));
    updated = count;
  }

  await appendDeliveryLog({
    providerId: "elite",
    requestType: "fallback_sync",
    success: true,
    message: `scanned=${targets.length} updated=${updated} delayed=${delayed}`,
  });

  return { ok: true, scanned: targets.length, updated, delayed };
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
    pending:
      count("preparing") +
      count("confirmed") +
      count("new") +
      count("pending_confirmation"),
    inTransit: count("shipped") + count("in_transit"),
    delivered: count("delivered"),
    returned: count("returned"),
    failed: count("failed_delivery") + count("refused") + count("cancelled"),
    codPending,
    codReceived,
    deliveryCosts,
  };
}

export type EliteWebhookPayloadInput = {
  package_id: string;
  delivery_status: number | string;
  event_time?: string;
  notif_type: string;
  /** Optional — only if Elite includes it */
  internal_id?: string;
};

/**
 * Apply verified Elite webhook payload atomically (idempotent).
 */
export async function applyEliteWebhook(payload: EliteWebhookPayloadInput): Promise<{
  ok: boolean;
  orderId?: string;
  duplicate?: boolean;
  unmatched?: boolean;
  errorCode?: string;
  errorMessage?: string;
}> {
  const eventKey = webhookEventKey(payload);
  const store = await readStore();
  const delivery = normalizeDeliveryState(store.delivery);
  const baseUrl =
    resolveEliteSecrets(delivery.providers.elite).baseUrl || undefined;

  const statusName = await resolveEliteStatusName(
    payload.delivery_status,
    baseUrl,
  );
  const eventAt = parseEliteEventTime(payload.event_time);
  const now = new Date().toISOString();

  const makeEvent = (
    processStatus: EliteWebhookProcessStatus,
    extra?: Partial<EliteWebhookEvent>,
  ): EliteWebhookEvent => ({
    id: crypto.randomUUID().slice(0, 12),
    at: now,
    packageId: payload.package_id,
    notifType: payload.notif_type,
    deliveryStatusId:
      payload.delivery_status != null
        ? String(payload.delivery_status)
        : undefined,
    deliveryStatusName: statusName,
    eventTime: payload.event_time,
    processStatus,
    eventKey,
    ...extra,
  });

  if (delivery.processedWebhookEventIds.includes(eventKey)) {
    await updateStore((prev) => {
      const d = normalizeDeliveryState(prev.delivery);
      return {
        ...prev,
        delivery: {
          ...d,
          webhookEvents: [
            makeEvent("duplicate", {
              message: "Duplicate webhook ignored",
              orderId: d.webhookEvents.find((e) => e.eventKey === eventKey)
                ?.orderId,
            }),
            ...d.webhookEvents,
          ].slice(0, MAX_WEBHOOK_EVENTS),
        },
      };
    });
    return { ok: true, duplicate: true };
  }

  const order = findOrderForElitePackage(
    store.orders,
    payload.package_id,
    payload.internal_id,
  );

  if (!order) {
    await updateStore((prev) => {
      const d = normalizeDeliveryState(prev.delivery);
      const log: DeliveryIntegrationLog = {
        id: crypto.randomUUID().slice(0, 10),
        at: now,
        providerId: "elite",
        requestType: "webhook",
        externalShipmentId: payload.package_id,
        success: false,
        errorCode: "UNKNOWN_PACKAGE",
        message: `Unmatched Elite package (notif=${payload.notif_type})`,
      };
      return {
        ...prev,
        delivery: {
          ...d,
          processedWebhookEventIds: [eventKey, ...d.processedWebhookEventIds].slice(
            0,
            MAX_WEBHOOK_IDS,
          ),
          integrationLogs: [log, ...d.integrationLogs].slice(0, MAX_LOGS),
          webhookEvents: [
            makeEvent("unmatched", {
              errorCode: "UNKNOWN_PACKAGE",
              message: "Unmatched Elite package — no local order linked",
            }),
            ...d.webhookEvents,
          ].slice(0, MAX_WEBHOOK_EVENTS),
        },
      };
    });
    return {
      ok: true,
      unmatched: true,
      errorCode: "UNKNOWN_PACKAGE",
      errorMessage: "Package not found locally",
    };
  }

  const statusMap = {
    ...DEFAULT_ELITE_STATUS_MAP,
    ...(delivery.providers.elite.config.statusMap ?? {}),
  };

  let payoutStatus = order.shipment?.payoutStatus;
  let codReceived = order.shipment?.codReceived;
  let elitePaymentStatus = order.shipment?.elitePaymentStatus ?? "unknown";
  let internalStatus = order.shipment?.internalStatus;
  let externalStatus = order.shipment?.externalStatus;
  let externalStatusName = order.shipment?.externalStatusName;
  let paymentCollectionStatus = (
    order as { paymentCollectionStatus?: string }
  ).paymentCollectionStatus;

  const notif = payload.notif_type;
  const hasStatus =
    payload.delivery_status !== undefined &&
    payload.delivery_status !== null &&
    String(payload.delivery_status).trim() !== "";

  if (notif === "package_paid") {
    payoutStatus = "paid";
    elitePaymentStatus = "paid";
    codReceived = order.shipment?.codExpected ?? order.total;
    paymentCollectionStatus = "paid_to_company";
  } else if (notif === "package_unpaid") {
    payoutStatus = "pending";
    elitePaymentStatus = "unpaid";
    codReceived = 0;
    paymentCollectionStatus = "pending_payout";
  }

  // ChangeStatus and any notif that includes delivery_status
  if (notif === "ChangeStatus" || hasStatus) {
    if (hasStatus) {
      externalStatus = String(payload.delivery_status);
      externalStatusName = statusName || externalStatusName;
      const mapped = mapEliteStatusId(externalStatus, statusMap);
      if (mapped) internalStatus = mapped;
    }
  }

  const ignored =
    notif !== "ChangeStatus" &&
    notif !== "package_paid" &&
    notif !== "package_unpaid" &&
    !hasStatus;

  await updateStore((prev) => {
    const d = normalizeDeliveryState(prev.delivery);
    const log: DeliveryIntegrationLog = {
      id: crypto.randomUUID().slice(0, 10),
      at: now,
      providerId: "elite",
      requestType: "webhook",
      orderId: order.orderId,
      externalShipmentId: payload.package_id,
      success: !ignored,
      errorCode: ignored ? "IGNORED_NOTIF" : undefined,
      message: ignored
        ? `Ignored notif_type=${notif}`
        : `${notif} status=${payload.delivery_status}`,
    };

    const event = makeEvent(ignored ? "ignored" : "processed", {
      orderId: order.orderId,
      resolvedInternalStatus: internalStatus,
      message: ignored
        ? `Ignored notif_type=${notif}`
        : `Applied ${notif}`,
    });

    if (ignored) {
      return {
        ...prev,
        delivery: {
          ...d,
          processedWebhookEventIds: [
            eventKey,
            ...d.processedWebhookEventIds,
          ].slice(0, MAX_WEBHOOK_IDS),
          integrationLogs: [log, ...d.integrationLogs].slice(0, MAX_LOGS),
          webhookEvents: [event, ...d.webhookEvents].slice(0, MAX_WEBHOOK_EVENTS),
        },
      };
    }

    return {
      ...prev,
      delivery: {
        ...d,
        processedWebhookEventIds: [eventKey, ...d.processedWebhookEventIds].slice(
          0,
          MAX_WEBHOOK_IDS,
        ),
        integrationLogs: [log, ...d.integrationLogs].slice(0, MAX_LOGS),
        webhookEvents: [event, ...d.webhookEvents].slice(0, MAX_WEBHOOK_EVENTS),
      },
      orders: prev.orders.map((o) => {
        if (o.orderId !== order.orderId) return o;
        const shipment: OrderShipment = {
          ...o.shipment!,
          providerId: "elite",
          externalShipmentId:
            o.shipment?.externalShipmentId || payload.package_id,
          trackingNumber: o.shipment?.trackingNumber || payload.package_id,
          internalId: o.shipment?.internalId || o.orderId,
          externalStatus,
          externalStatusName,
          internalStatus,
          payoutStatus,
          codReceived,
          elitePaymentStatus,
          eliteLastEventAt: eventAt,
          lastWebhookAt: now,
          lastWebhookNotifType: notif,
          lastSyncAt: now,
          syncState: "synced",
          lastError: undefined,
          eliteLinkedAt: o.shipment?.eliteLinkedAt || now,
        };
        const deliveryHistory = [
          historyEntry({
            providerId: "elite",
            externalStatus,
            internalStatus,
            rawEventId: eventKey,
            note: `Elite webhook: ${notif}${statusName ? ` (${statusName})` : ""}`,
            source: "webhook",
            at: eventAt,
          }),
          ...(o.deliveryHistory ?? []),
        ].slice(0, 100);

        return {
          ...o,
          shipment,
          deliveryHistory,
          deliveryStatus: internalStatus ?? o.deliveryStatus,
          orderStatus: deriveOrderStatus(
            o.orderStatus,
            internalStatus,
          ) as typeof o.orderStatus,
          paymentCollectionStatus:
            (paymentCollectionStatus as typeof o.paymentCollectionStatus) ??
            o.paymentCollectionStatus,
          updatedAt: now,
        };
      }),
    };
  });

  return { ok: true, orderId: order.orderId };
}
