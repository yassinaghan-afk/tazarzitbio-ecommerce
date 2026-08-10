import crypto from "node:crypto";

/**
 * Meta requires PII hashed with SHA-256 after normalization.
 * @see https://developers.facebook.com/docs/marketing-api/conversions-api/parameters/customer-information-parameters
 */

export function sha256Hex(value: string): string {
  return crypto.createHash("sha256").update(value).digest("hex");
}

/** Lowercase, trim, strip spaces and punctuation. Empty → omit. */
export function normalizeMetaNamePart(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

/**
 * Normalize phone to digits only, prefer E.164 without +.
 * Moroccan local numbers (0xxxxxxxxx) → 212xxxxxxxxx.
 */
export function normalizeMetaPhone(phone: string): string {
  let digits = phone.replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("00")) digits = digits.slice(2);
  // local Morocco mobile/landline starting with 0
  if (digits.startsWith("0") && digits.length >= 9) {
    digits = `212${digits.slice(1)}`;
  }
  return digits;
}

export function normalizeMetaCity(city: string): string {
  return city
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

export function hashIfPresent(normalized: string): string | undefined {
  if (!normalized) return undefined;
  return sha256Hex(normalized);
}

export function splitFullName(fullName: string): { first?: string; last?: string } {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return {};
  if (parts.length === 1) {
    const fn = normalizeMetaNamePart(parts[0]);
    return fn ? { first: fn } : {};
  }
  const first = normalizeMetaNamePart(parts[0]);
  const last = normalizeMetaNamePart(parts.slice(1).join(" "));
  return {
    ...(first ? { first } : {}),
    ...(last ? { last } : {}),
  };
}
