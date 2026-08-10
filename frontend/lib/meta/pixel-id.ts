/**
 * Public Meta Pixel / Dataset ID for TazarzitBio.
 * Pixel IDs are public (they appear in HTML). Access tokens remain server-only.
 *
 * Official Meta snippet: fbq('init', '1371182047797117');
 */
export const META_PIXEL_DATASET_ID = "1371182047797117";

/**
 * Resolve the Pixel ID for browser/server non-secret use.
 * Priority: explicit override → META_PIXEL_ID / NEXT_PUBLIC_META_PIXEL_ID → official dataset.
 */
export function resolveMetaPixelId(override?: string | null): string {
  const fromArg = (override ?? "").trim();
  if (fromArg) return fromArg.replace(/[^\d]/g, "") || fromArg;

  if (typeof process !== "undefined") {
    const fromEnv = (
      process.env.META_PIXEL_ID ||
      process.env.NEXT_PUBLIC_META_PIXEL_ID ||
      ""
    )
      .toString()
      .trim()
      .replace(/^["']|["']$/g, "");
    if (fromEnv) return fromEnv.replace(/[^\d]/g, "") || fromEnv;
  }

  return META_PIXEL_DATASET_ID;
}
