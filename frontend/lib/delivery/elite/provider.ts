
import type { DeliveryStatus } from "@/lib/admin/ops-types";
import {
  resolveEliteSecrets,
  toPublicDeliveryConfig,
} from "@/lib/delivery/secrets";
import type {
  CreateShipmentInput,
  CreateShipmentResult,
  DeliveryProvider,
  RefreshShipmentResult,
  WebhookProcessResult,
} from "@/lib/delivery/types";
import { readStore } from "@/lib/server/store";

/**
 * Elite Delivery provider stub.
 *
 * Concrete HTTP calls, auth headers, payloads, and status enums are intentionally
 * NOT implemented until official API documentation is provided.
 */
export class EliteDeliveryProvider implements DeliveryProvider {
  readonly id = "elite" as const;
  readonly displayName = "Elite Delivery";

  async isConfigured(): Promise<boolean> {
    const store = await readStore();
    const record = store.delivery?.providers?.elite;
    const pub = toPublicDeliveryConfig(record);
    if (!pub.enabled) return false;
    const { secrets, baseUrl } = resolveEliteSecrets(record);
    return Boolean(secrets.apiKey && baseUrl);
  }

  mapStatus(externalStatus: string): DeliveryStatus | null {
    void externalStatus;
    return null;
  }

  mapStatusWithConfig(
    externalStatus: string,
    statusMap: Record<string, DeliveryStatus>,
  ): DeliveryStatus | null {
    const key = externalStatus.trim();
    if (!key) return null;
    if (statusMap[key]) return statusMap[key];
    // Case-insensitive fallback
    const found = Object.entries(statusMap).find(
      ([k]) => k.toLowerCase() === key.toLowerCase(),
    );
    return found ? found[1] : null;
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

    // Idempotency: never create a second Elite shipment for the same order.
    if (order.shipment?.providerId === "elite" && order.shipment.externalShipmentId) {
      return {
        ok: true,
        alreadyExists: true,
        shipment: order.shipment,
      };
    }

    const configured = await this.isConfigured();
    if (!configured) {
      return {
        ok: false,
        errorCode: "PROVIDER_NOT_CONFIGURED",
        errorMessage:
          "Elite Delivery غير مهيأ بعد. أضف بيانات الاعتماد في الإعدادات ووفّر وثائق الـ API.",
      };
    }

    // Official create-shipment HTTP call will be implemented from Elite docs.
    return {
      ok: false,
      errorCode: "API_DOCS_REQUIRED",
      errorMessage:
        "تعذر الاتصال بشركة التوصيل — تكامل Elite Delivery بانتظار الوثائق الرسمية (لا Endpoints مخمّنة).",
    };
  }

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

    return {
      ok: false,
      errorCode: "API_DOCS_REQUIRED",
      errorMessage:
        "تعذر الاتصال بشركة التوصيل — تحديث الحالة بانتظار وثائق Elite Delivery الرسمية.",
    };
  }

  async verifyWebhook(
    _headers: Headers,
    _rawBody: string,
  ): Promise<{ ok: boolean; errorCode?: string }> {
    // Until docs specify HMAC/token verification, reject all webhook traffic.
    return { ok: false, errorCode: "WEBHOOK_DOCS_REQUIRED" };
  }

  async handleWebhook(
    headers: Headers,
    rawBody: string,
  ): Promise<WebhookProcessResult> {
    const verified = await this.verifyWebhook(headers, rawBody);
    if (!verified.ok) {
      return {
        ok: false,
        errorCode: verified.errorCode || "WEBHOOK_UNAUTHORIZED",
        errorMessage: "Webhook rejected — verification not configured from official docs yet.",
      };
    }
    return {
      ok: false,
      errorCode: "API_DOCS_REQUIRED",
      errorMessage: "Webhook handler awaiting official Elite Delivery documentation.",
    };
  }
}

export const eliteDeliveryProvider = new EliteDeliveryProvider();
