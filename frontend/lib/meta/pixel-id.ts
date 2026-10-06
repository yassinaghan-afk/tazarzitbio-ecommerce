/**
 * Public Meta Pixel / Dataset ID for TazarzitBio.
 * Pixel IDs are public (they appear in HTML). Access tokens remain server-only.
 *
 * Official Meta snippet: fbq('init', '1751815242714179');
 */
export const META_PIXEL_DATASET_ID = "1751815242714179";

/**
 * Previous pixel. Still stored in admin tracking settings / server env on
 * existing deployments, so browser resolution maps it to the current pixel.
 * The Conversions API keeps using it until META_PIXEL_ID + a matching
 * META_CAPI_ACCESS_TOKEN are configured for the new dataset.
 */
export const LEGACY_META_PIXEL_ID = "1371182047797117";

function digitsOnly(value: string): string {
  return value.replace(/[^\d]/g, "") || value;
}

function upgradeLegacy(id: string): string {
  return id === LEGACY_META_PIXEL_ID ? META_PIXEL_DATASET_ID : id;
}

/**
 * Resolve the browser Pixel ID.
 * Priority: explicit override → META_PIXEL_ID / NEXT_PUBLIC_META_PIXEL_ID → official dataset.
 */
export function resolveMetaPixelId(override?: string | null): string {
  const fromArg = (override ?? "").trim();
  if (fromArg) return upgradeLegacy(digitsOnly(fromArg));

  if (typeof process !== "undefined") {
    const fromEnv = (
      process.env.META_PIXEL_ID ||
      process.env.NEXT_PUBLIC_META_PIXEL_ID ||
      ""
    )
      .toString()
      .trim()
      .replace(/^["']|["']$/g, "");
    if (fromEnv) return upgradeLegacy(digitsOnly(fromEnv));
  }

  return META_PIXEL_DATASET_ID;
}
