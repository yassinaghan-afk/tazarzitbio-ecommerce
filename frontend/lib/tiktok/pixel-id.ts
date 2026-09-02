/**
 * Public TikTok Pixel ID for TazarzitBio.
 * Pixel IDs are public (they appear in HTML). No secrets here.
 */
export const TIKTOK_PIXEL_DATASET_ID = "DAC3R0BC77UDHLL3CRC0";

/**
 * Resolve the TikTok Pixel ID for browser use.
 * Priority: explicit override → NEXT_PUBLIC_TIKTOK_PIXEL_ID → official dataset.
 */
export function resolveTikTokPixelId(override?: string | null): string {
  const raw =
    (typeof override === "string" && override.trim()) ||
    process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID?.trim() ||
    TIKTOK_PIXEL_DATASET_ID;
  const safe = raw.replace(/[^A-Za-z0-9]/g, "");
  return safe || TIKTOK_PIXEL_DATASET_ID;
}
