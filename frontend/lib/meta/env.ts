/**
 * Meta Pixel + Conversions API — server-side env only for secrets.
 * META_CAPI_ACCESS_TOKEN must never be imported into client components.
 */

import { META_PIXEL_DATASET_ID, resolveMetaPixelId } from "@/lib/meta/pixel-id";

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

/** Dataset / Pixel ID — safe to expose to the browser via public tracking API. */
export function getMetaPixelId(): string {
  return resolveMetaPixelId(
    readEnv("META_PIXEL_ID") || readEnv("NEXT_PUBLIC_META_PIXEL_ID") || META_PIXEL_DATASET_ID,
  );
}

/** Server-only access token for the Conversions API. Never expose to clients. */
export function getMetaCapiAccessToken(): string {
  return readEnv("META_CAPI_ACCESS_TOKEN");
}

/** Optional Events Manager Test Events code (server-only). */
export function getMetaTestEventCode(): string {
  return readEnv("META_TEST_EVENT_CODE");
}

export function isMetaCapiConfigured(): boolean {
  return Boolean(getMetaPixelId() && getMetaCapiAccessToken());
}
