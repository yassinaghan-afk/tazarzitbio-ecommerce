
import type {
  DeliveryProviderPublicConfig,
  DeliveryProviderRecord,
  DeliveryProviderSecrets,
} from "@/lib/delivery/types";
import { DEFAULT_ELITE_PUBLIC_CONFIG } from "@/lib/delivery/types";

function readEnv(name: string): string {
  const raw = process.env[name];
  if (raw == null) return "";
  let value = String(raw).trim();
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1).trim();
  }
  return value;
}

function maskSecret(value: string | undefined): string | undefined {
  if (!value) return undefined;
  if (value.length <= 4) return "••••";
  return `••••${value.slice(-4)}`;
}

/**
 * Resolve Elite credentials: environment overrides store secrets.
 * Env names (optional until docs/credentials provided):
 *   ELITE_DELIVERY_API_KEY
 *   ELITE_DELIVERY_WEBHOOK_SECRET
 *   ELITE_DELIVERY_BASE_URL
 *   ELITE_DELIVERY_ACCOUNT_ID
 */
export function resolveEliteSecrets(
  record: DeliveryProviderRecord | undefined,
): {
  secrets: DeliveryProviderSecrets;
  baseUrl?: string;
  accountId?: string;
  fromEnv: { apiKey: boolean; webhookSecret: boolean; baseUrl: boolean };
} {
  const storeSecrets = record?.secrets ?? {};
  const envKey = readEnv("ELITE_DELIVERY_API_KEY");
  const envWebhook = readEnv("ELITE_DELIVERY_WEBHOOK_SECRET");
  const envBase = readEnv("ELITE_DELIVERY_BASE_URL");
  const envAccount = readEnv("ELITE_DELIVERY_ACCOUNT_ID");

  return {
    secrets: {
      apiKey: envKey || storeSecrets.apiKey,
      webhookSecret: envWebhook || storeSecrets.webhookSecret,
      extra: storeSecrets.extra,
    },
    baseUrl: envBase || record?.config.baseUrl,
    accountId: envAccount || record?.config.accountId,
    fromEnv: {
      apiKey: Boolean(envKey),
      webhookSecret: Boolean(envWebhook),
      baseUrl: Boolean(envBase),
    },
  };
}

/** Safe config for admin UI — never includes raw secrets. */
export function toPublicDeliveryConfig(
  record: DeliveryProviderRecord | undefined,
): DeliveryProviderPublicConfig {
  const resolved = resolveEliteSecrets(record);
  const apiKey = resolved.secrets.apiKey;
  const webhook = resolved.secrets.webhookSecret;
  const base = {
    ...DEFAULT_ELITE_PUBLIC_CONFIG,
    ...(record?.config ?? {}),
    baseUrl: resolved.baseUrl,
    accountId: resolved.accountId,
    apiKeyConfigured: Boolean(apiKey),
    webhookSecretConfigured: Boolean(webhook),
    apiKeyHint: maskSecret(apiKey),
  };
  return base;
}
