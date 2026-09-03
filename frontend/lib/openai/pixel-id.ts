/**
 * Public OpenAI Pixel ID for Tazarzit Bio.
 * Pixel IDs are public browser identifiers, not secrets.
 */
export const OPENAI_PIXEL_ID = "QznW1JzqiA6MEXfb69R8So";

/**
 * Resolve the OpenAI Pixel ID for browser use.
 * Priority: explicit override -> NEXT_PUBLIC_OPENAI_PIXEL_ID -> default ID.
 */
export function resolveOpenAIPixelId(override?: string | null): string {
  const raw =
    (typeof override === "string" && override.trim()) ||
    process.env.NEXT_PUBLIC_OPENAI_PIXEL_ID?.trim() ||
    OPENAI_PIXEL_ID;
  const safe = raw.replace(/[^A-Za-z0-9]/g, "");
  return safe || OPENAI_PIXEL_ID;
}
