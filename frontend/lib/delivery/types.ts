/**
 * Courier-agnostic delivery types.
 * Elite Delivery concrete request/response shapes are filled ONLY from official docs.
 */

import type { DeliveryStatus } from "@/lib/admin/ops-types";

export type DeliveryProviderId = "elite" | string;

export type CodPayoutStatus =
  | "pending"
  | "paid"
  | "partially_paid"
  | "disputed";

export type DeliveryIntegrationLogLevel = "info" | "success" | "error";

export interface DeliveryProviderPublicConfig {
  providerId: DeliveryProviderId;
  displayName: string;
  enabled: boolean;
  /** Non-secret account / store identifier if required by the courier */
  accountId?: string;
  /** Base URL — stored server-side; never required in the browser bundle as a secret */
  baseUrl?: string;
  /** True when an API key/token is stored (value never returned) */
  apiKeyConfigured: boolean;
  /** True when webhook secret is stored */
  webhookSecretConfigured: boolean;
  /** Optional masked hint e.g. ••••ab12 */
  apiKeyHint?: string;
  /** Elite→internal status map — keys filled from official docs later */
  statusMap: Record<string, DeliveryStatus>;
  updatedAt?: string;
}

/** Server-only secrets — never serialize into client responses. */
export interface DeliveryProviderSecrets {
  apiKey?: string;
  webhookSecret?: string;
  /** Extra opaque fields from future docs */
  extra?: Record<string, string>;
}

export interface DeliveryProviderRecord {
  config: DeliveryProviderPublicConfig;
  secrets: DeliveryProviderSecrets;
}

export type ShipmentSyncState =
  | "synced"
  | "delayed"
  | "error"
  | "not_linked"
  | "pending";

/** Elite COD/payment collection state — separate from delivery status */
export type ElitePaymentStatus = "paid" | "unpaid" | "unknown";

export interface OrderShipment {
  providerId: DeliveryProviderId;
  /** External shipment / parcel id from courier (Elite package_id) */
  externalShipmentId?: string;
  /** Our order id sent as Elite internal_id */
  internalId?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  /** Raw Elite delivery_status ID as string */
  externalStatus?: string;
  /** Official Elite status name from GET /statuses */
  externalStatusName?: string;
  /** Mapped internal delivery status */
  internalStatus?: DeliveryStatus;
  /** Elite payment collection (package_paid / package_unpaid) */
  elitePaymentStatus?: ElitePaymentStatus;
  createdAt?: string;
  /** When package_id was first linked locally */
  eliteLinkedAt?: string;
  /** Last Elite webhook/event timestamp */
  eliteLastEventAt?: string;
  /** Last successful local↔Elite sync */
  lastSyncAt?: string;
  lastWebhookAt?: string;
  lastWebhookNotifType?: string;
  syncState?: ShipmentSyncState;
  /** Customer-facing shipping charge already on the order (reference) */
  customerShippingCharge?: number;
  /** Actual fee charged by courier — from API when available */
  courierShippingCost?: number;
  /** COD amount expected from courier */
  codExpected?: number;
  /** COD amount confirmed received from courier */
  codReceived?: number;
  payoutStatus?: CodPayoutStatus;
  /** Idempotency / client reference used when creating the shipment */
  idempotencyKey?: string;
  lastError?: string;
}

export interface DeliveryStatusHistoryEntry {
  id: string;
  providerId: DeliveryProviderId;
  externalStatus?: string;
  internalStatus?: DeliveryStatus;
  rawEventId?: string;
  note?: string;
  at: string;
  source: "api" | "webhook" | "admin" | "system";
}

export interface DeliveryIntegrationLog {
  id: string;
  at: string;
  providerId: DeliveryProviderId;
  requestType: string;
  orderId?: string;
  externalShipmentId?: string;
  success: boolean;
  errorCode?: string;
  /** Safe message — never includes tokens */
  message?: string;
}

export type EliteWebhookProcessStatus =
  | "processed"
  | "duplicate"
  | "ignored"
  | "failed"
  | "unmatched";

/** Structured webhook/event log for Admin Delivery → Webhooks */
export interface EliteWebhookEvent {
  id: string;
  at: string;
  packageId: string;
  notifType: string;
  deliveryStatusId?: string;
  deliveryStatusName?: string;
  eventTime?: string;
  orderId?: string;
  processStatus: EliteWebhookProcessStatus;
  resolvedInternalStatus?: DeliveryStatus;
  errorCode?: string;
  message?: string;
  /** Idempotency key used for dedupe */
  eventKey: string;
}

export interface CreateShipmentInput {
  orderId: string;
  /** Force recreate is intentionally unsupported by default */
  idempotencyKey: string;
}

export interface CreateShipmentResult {
  ok: boolean;
  shipment?: OrderShipment;
  errorCode?: string;
  errorMessage?: string;
  /** True when shipment already existed — no duplicate create */
  alreadyExists?: boolean;
  /** Elite-matched city name when inferred/resolved during send */
  resolvedCityName?: string;
}

export interface RefreshShipmentResult {
  ok: boolean;
  shipment?: OrderShipment;
  errorCode?: string;
  errorMessage?: string;
}

export interface WebhookProcessResult {
  ok: boolean;
  orderId?: string;
  duplicate?: boolean;
  errorCode?: string;
  errorMessage?: string;
}

/**
 * Courier provider contract.
 * Implementations must follow official API docs — no invented endpoints.
 */
export interface DeliveryProvider {
  readonly id: DeliveryProviderId;
  readonly displayName: string;

  isConfigured(): Promise<boolean>;

  /**
   * Create a shipment for an order.
   * Must be idempotent when the courier / our store already has a shipment.
   */
  createShipment(input: CreateShipmentInput): Promise<CreateShipmentResult>;

  refreshShipment(orderId: string): Promise<RefreshShipmentResult>;

  /**
   * Map courier status string → internal DeliveryStatus.
   * Uses configured statusMap; unknown statuses return null.
   */
  mapStatus(externalStatus: string): DeliveryStatus | null;

  /**
   * Verify webhook authenticity per official docs (HMAC, token, etc.).
   * Until docs arrive, must reject.
   */
  verifyWebhook(
    headers: Headers,
    rawBody: string,
  ): Promise<{ ok: boolean; errorCode?: string }>;

  /**
   * Apply a verified webhook payload.
   * Payload parsing is provider-specific and docs-driven.
   */
  handleWebhook(
    headers: Headers,
    rawBody: string,
  ): Promise<WebhookProcessResult>;
}

export const DEFAULT_ELITE_PUBLIC_CONFIG: DeliveryProviderPublicConfig = {
  providerId: "elite",
  displayName: "Elite Delivery",
  enabled: false,
  apiKeyConfigured: false,
  webhookSecretConfigured: false,
  statusMap: {},
};

export const DEFAULT_DELIVERY_STATE = {
  providers: {
    elite: {
      config: { ...DEFAULT_ELITE_PUBLIC_CONFIG },
      secrets: {} as DeliveryProviderSecrets,
    } satisfies DeliveryProviderRecord,
  },
  /** Dedup webhook event ids */
  processedWebhookEventIds: [] as string[],
  integrationLogs: [] as DeliveryIntegrationLog[],
  /** Structured Elite webhook events (newest first) */
  webhookEvents: [] as EliteWebhookEvent[],
};

export type DeliveryState = typeof DEFAULT_DELIVERY_STATE;

export function normalizeDeliveryState(raw: unknown): DeliveryState {
  if (!raw || typeof raw !== "object") {
    return structuredClone(DEFAULT_DELIVERY_STATE);
  }
  const d = raw as Partial<DeliveryState>;
  return {
    providers: {
      elite: {
        config: {
          ...DEFAULT_DELIVERY_STATE.providers.elite.config,
          ...(d.providers?.elite?.config ?? {}),
        },
        secrets: { ...(d.providers?.elite?.secrets ?? {}) },
      },
    },
    processedWebhookEventIds: Array.isArray(d.processedWebhookEventIds)
      ? d.processedWebhookEventIds
      : [],
    integrationLogs: Array.isArray(d.integrationLogs) ? d.integrationLogs : [],
    webhookEvents: Array.isArray(d.webhookEvents) ? d.webhookEvents : [],
  };
}
