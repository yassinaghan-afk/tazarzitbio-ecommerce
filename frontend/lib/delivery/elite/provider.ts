/**
 * Elite Delivery provider — official API only.
 * Docs: https://www.elitedelivery.ma/api-documentation.php
 */

import type { DeliveryStatus } from "@/lib/admin/ops-types";
import { resolveEliteCityId } from "@/lib/delivery/elite/cities";
import {
  ELITE_DEFAULT_BASE_URL,
  eliteCreateBatch,
  eliteGetCities,
  eliteGetStores,
  extractPackageId,
  type EliteCity,
} from "@/lib/delivery/elite/client";
import {
  DEFAULT_ELITE_STATUS_MAP,
  mapEliteStatusId,
} from "@/lib/delivery/elite/status-map";
import {
  resolveEliteSecrets,
  toPublicDeliveryConfig,
} from "@/lib/delivery/secrets";
import type {
  CreateShipmentInput,
  CreateShipmentResult,
  DeliveryProvider,
  OrderShipment,
  RefreshShipmentResult,
  WebhookProcessResult,
} from "@/lib/delivery/types";
import type { OrderRecord } from "@/lib/orders/types";
import { readStore } from "@/lib/server/store";

let citiesCache: { at: number; cities: EliteCity[]; baseUrl: string } | null =
  null;
const CITIES_TTL_MS = 6 * 60 * 60 * 1000;

export async function getEliteCitiesCached(
  baseUrl: string,
): Promise<EliteCity[] | null> {
  if (
    citiesCache &&
    citiesCache.baseUrl === baseUrl &&
    Date.now() - citiesCache.at < CITIES_TTL_MS
  ) {
    return citiesCache.cities;
  }
  const res = await eliteGetCities(baseUrl);
  if (!res.ok) return null;
  citiesCache = { at: Date.now(), cities: res.data, baseUrl };
  return res.data;
}

function buildProductDescription(order: OrderRecord): string {
  return order.products
    .map((p) => {
      const weight = p.weight ? ` ${p.weight}` : "";
      const name = (p.nameAr || p.offerLabel || p.slug || p.productId).trim();
      return `${name}${weight} x ${p.quantity}`;
    })
    .join(" + ");
}

function validateOrderForElite(order: OrderRecord): string | null {
  if (!order.customerName?.trim()) return "اسم الزبون مطلوب";
  if (!order.phone?.trim()) return "رقم الهاتف مطلوب";
  if (!order.address?.trim()) return "العنوان مطلوب";
  if (!order.city?.trim()) return "المدينة مطلوبة لإرسال الشحنة إلى Elite";
  if (!(order.total > 0)) return "مبلغ الطلب غير صالح";
  if (!order.products?.length) return "الطلب بدون منتجات";
  return null;
}

export type EliteWebhookPayload = {
  package_id: string;
  delivery_status: number | string;
  event_time?: string;
  notif_type: string;
  /** Present only when Elite includes it */
  internal_id?: string;
};

export function parseEliteWebhookPayload(
  rawBody: string,
): EliteWebhookPayload | null {
  try {
    const data = JSON.parse(rawBody) as Record<string, unknown>;
    if (!data || typeof data !== "object") return null;
    if (typeof data.package_id !== "string" || !data.package_id.trim()) {
      return null;
    }
    if (typeof data.notif_type !== "string" || !data.notif_type.trim()) {
      return null;
    }
    return {
      package_id: data.package_id.trim(),
      delivery_status: data.delivery_status as number | string,
      event_time:
        typeof data.event_time === "string" ? data.event_time : undefined,
      notif_type: data.notif_type,
      internal_id:
        typeof data.internal_id === "string" && data.internal_id.trim()
          ? data.internal_id.trim()
          : undefined,
    };
  } catch {
    return null;
  }
}

export class EliteDeliveryProvider implements DeliveryProvider {
  readonly id = "elite" as const;
  readonly displayName = "Elite Delivery";

  async isConfigured(): Promise<boolean> {
    const store = await readStore();
    const record = store.delivery?.providers?.elite;
    const pub = toPublicDeliveryConfig(record);
    const { secrets, baseUrl, accountId, fromEnv } = resolveEliteSecrets(record);
    // Env credentials can activate even if UI toggle not flipped yet —
    // but explicit enabled=false in store still allows env when token present.
    const hasCreds = Boolean(
      secrets.apiKey && (baseUrl || ELITE_DEFAULT_BASE_URL) && accountId,
    );
    if (!hasCreds) return false;
    return pub.enabled || fromEnv.apiKey;
  }

  mapStatus(externalStatus: string): DeliveryStatus | null {
    return mapEliteStatusId(externalStatus, DEFAULT_ELITE_STATUS_MAP);
  }

  mapStatusWithConfig(
    externalStatus: string,
    statusMap: Record<string, DeliveryStatus>,
  ): DeliveryStatus | null {
    const merged = { ...DEFAULT_ELITE_STATUS_MAP, ...statusMap };
    return mapEliteStatusId(externalStatus, merged);
  }

  async createShipment(input: CreateShipmentInput): Promise<CreateShipmentResult> {
    const store = await readStore();
    const order = store.orders.find((o) => o.orderId === input.orderId);
    if (!order) {
      return {
        ok: false,
        errorCode: "ORDER_NOT_FOUND",
        errorMessage: "الطلب غير موجود",
      };
    }

    if (
      order.shipment?.providerId === "elite" &&
      order.shipment.externalShipmentId
    ) {
      return {
        ok: true,
        alreadyExists: true,
        shipment: order.shipment,
      };
    }

    const record = store.delivery?.providers?.elite;
    const { secrets, baseUrl, accountId, fromEnv } = resolveEliteSecrets(record);
    const token = secrets.apiKey;
    const resolvedBase = baseUrl || ELITE_DEFAULT_BASE_URL;
    const enabled = toPublicDeliveryConfig(record).enabled || fromEnv.apiKey;

    if (!enabled || !token || !accountId) {
      return {
        ok: false,
        errorCode: "PROVIDER_NOT_CONFIGURED",
        errorMessage:
          "Elite Delivery غير مهيأ. فعّل الإعداد وأضف API Token و Store ID.",
      };
    }

    const validationError = validateOrderForElite(order);
    if (validationError) {
      return {
        ok: false,
        errorCode: "VALIDATION_ERROR",
        errorMessage: validationError,
      };
    }

    const cities = await getEliteCitiesCached(resolvedBase);
    if (!cities) {
      return {
        ok: false,
        errorCode: "CITIES_UNAVAILABLE",
        errorMessage: "تعذر تحميل قائمة مدن Elite Delivery",
      };
    }

    const cityMatch = resolveEliteCityId(order.city, cities);
    if (!cityMatch.ok) {
      return {
        ok: false,
        errorCode: "CITY_NOT_MAPPED",
        errorMessage:
          cityMatch.reason === "EMPTY"
            ? "المدينة مطلوبة"
            : `تعذر مطابقة المدينة "${cityMatch.input}" مع مدن Elite Delivery. اختر مدينة مدعومة أو صحّح اسم المدينة.`,
      };
    }

    const storeId = Number(accountId);
    if (!Number.isFinite(storeId) || storeId <= 0) {
      return {
        ok: false,
        errorCode: "INVALID_STORE_ID",
        errorMessage: "Store ID غير صالح",
      };
    }

    const product = buildProductDescription(order);
    const price = String(Math.round(order.total));
    const note = [order.customerNote, order.adminNote, order.confirmationNotes]
      .filter(Boolean)
      .join(" | ")
      .slice(0, 400);

    const batch = await eliteCreateBatch(resolvedBase, token, {
      store_id: storeId,
      packages: [
        {
          receiver_name: order.customerName.trim(),
          address: order.address.trim(),
          city: cityMatch.cityId,
          phone: order.phone.trim(),
          price,
          product,
          note: note || undefined,
          internal_id: order.orderId,
        },
      ],
    });

    if (!batch.ok) {
      return {
        ok: false,
        errorCode: batch.errorCode,
        errorMessage: batch.errorMessage,
      };
    }

    const first = batch.data.packages[0];
    let resolvedId = extractPackageId(first, order.orderId);
    if (!resolvedId && batch.data.raw) {
      const rawStr = JSON.stringify(batch.data.raw);
      const m = rawStr.match(/CL-ELITE-[A-Z0-9-]+/i);
      if (m) resolvedId = m[0];
    }

    if (!resolvedId) {
      return {
        ok: false,
        errorCode: "NO_PACKAGE_ID",
        errorMessage:
          "تم قبول الطلب من Elite لكن لم يُرجع رقم طرد واضح. راجع سجلات التكامل.",
      };
    }

    const statusMap = {
      ...DEFAULT_ELITE_STATUS_MAP,
      ...(record?.config.statusMap ?? {}),
    };
    const externalStatus = first?.status != null ? String(first.status) : "0";
    const internalStatus =
      this.mapStatusWithConfig(externalStatus, statusMap) ?? "preparing";

    const { resolveEliteStatusName } = await import(
      "@/lib/delivery/elite/status-catalog"
    );
    const externalStatusName = await resolveEliteStatusName(
      externalStatus,
      resolvedBase,
    );

    const now = new Date().toISOString();
    const shipment: OrderShipment = {
      providerId: "elite",
      externalShipmentId: resolvedId,
      trackingNumber: resolvedId,
      internalId: order.orderId,
      externalStatus,
      externalStatusName,
      internalStatus,
      createdAt: now,
      eliteLinkedAt: now,
      lastSyncAt: now,
      syncState: "synced",
      elitePaymentStatus: "unknown",
      customerShippingCharge: order.shippingPrice,
      codExpected: order.total,
      payoutStatus: "pending",
      idempotencyKey: input.idempotencyKey,
    };

    return { ok: true, shipment };
  }

  /**
   * Elite official docs do not expose a single-shipment status GET.
   * Refresh verifies credentials + remaps last known status via /statuses.
   */
  async refreshShipment(orderId: string): Promise<RefreshShipmentResult> {
    const store = await readStore();
    const order = store.orders.find((o) => o.orderId === orderId);
    if (!order?.shipment?.externalShipmentId) {
      return {
        ok: false,
        errorCode: "NO_SHIPMENT",
        errorMessage: "لا توجد شحنة مرتبطة بهذا الطلب",
      };
    }

    const configured = await this.isConfigured();
    if (!configured) {
      return {
        ok: false,
        errorCode: "PROVIDER_NOT_CONFIGURED",
        errorMessage: "Elite Delivery غير مهيأ",
      };
    }

    const record = store.delivery?.providers?.elite;
    const { baseUrl } = resolveEliteSecrets(record);
    const resolvedBase = baseUrl || ELITE_DEFAULT_BASE_URL;

    // Touch live Elite API (status catalog) so refresh is not a pure local stamp.
    const { invalidateEliteStatusCatalog, resolveEliteStatusName } =
      await import("@/lib/delivery/elite/status-catalog");
    invalidateEliteStatusCatalog();
    const externalStatusName = await resolveEliteStatusName(
      order.shipment.externalStatus,
      resolvedBase,
    );

    const verify = await this.verifyCredentials();
    if (!verify.ok) {
      return {
        ok: false,
        errorCode: "ELITE_UNREACHABLE",
        errorMessage: verify.errorMessage || "تعذر التحقق من Elite",
        shipment: {
          ...order.shipment,
          syncState: "error",
          lastError: verify.errorMessage,
        },
      };
    }

    return {
      ok: true,
      shipment: {
        ...order.shipment,
        externalStatusName:
          externalStatusName || order.shipment.externalStatusName,
        lastSyncAt: new Date().toISOString(),
        syncState: "synced",
        lastError: undefined,
      },
    };
  }

  async verifyWebhook(
    headers: Headers,
    rawBody: string,
  ): Promise<{ ok: boolean; errorCode?: string }> {
    return this.verifyWebhookWithSecret(headers, rawBody, undefined);
  }

  async verifyWebhookWithSecret(
    headers: Headers,
    rawBody: string,
    pathSecret?: string,
  ): Promise<{ ok: boolean; errorCode?: string }> {
    const store = await readStore();
    const { secrets } = resolveEliteSecrets(store.delivery?.providers?.elite);
    const expected = secrets.webhookSecret?.trim();

    if (!expected) {
      return { ok: false, errorCode: "WEBHOOK_SECRET_NOT_CONFIGURED" };
    }

    const headerKey =
      headers.get("x-webhook-key") ||
      headers.get("x-elite-webhook-key") ||
      "";
    const candidate = (pathSecret || headerKey || "").trim();
    if (!candidate || candidate !== expected) {
      return { ok: false, errorCode: "WEBHOOK_UNAUTHORIZED" };
    }

    if (!parseEliteWebhookPayload(rawBody)) {
      return { ok: false, errorCode: "INVALID_PAYLOAD" };
    }

    return { ok: true };
  }

  /**
   * Payload parsing only — order mutation lives in service.applyEliteWebhook
   * to avoid circular imports.
   */
  async handleWebhook(
    headers: Headers,
    rawBody: string,
  ): Promise<WebhookProcessResult> {
    const verified = await this.verifyWebhook(headers, rawBody);
    if (!verified.ok) {
      return {
        ok: false,
        errorCode: verified.errorCode || "WEBHOOK_UNAUTHORIZED",
        errorMessage: "Webhook rejected",
      };
    }
    return {
      ok: true,
      errorCode: "DELEGATE_TO_SERVICE",
      errorMessage: "Use applyEliteWebhook in service layer",
    };
  }

  async verifyCredentials(): Promise<{
    ok: boolean;
    storeId?: string;
    brandName?: string;
    errorMessage?: string;
  }> {
    const store = await readStore();
    const { secrets, baseUrl, accountId } = resolveEliteSecrets(
      store.delivery?.providers?.elite,
    );
    if (!secrets.apiKey) {
      return { ok: false, errorMessage: "API token missing" };
    }
    const res = await eliteGetStores(
      baseUrl || ELITE_DEFAULT_BASE_URL,
      secrets.apiKey,
    );
    if (!res.ok) {
      return { ok: false, errorMessage: res.errorMessage };
    }
    const match =
      res.data.find((s) => String(s.id) === String(accountId)) ?? res.data[0];
    return {
      ok: true,
      storeId: match?.id,
      brandName: match?.brand_name?.trim(),
    };
  }
}

export const eliteDeliveryProvider = new EliteDeliveryProvider();
