/**
 * Safe numeric / currency helpers for Admin dashboards.
 * Never display NaN, Infinity, or undefined money values.
 */

export function safeNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  return fallback;
}

/** True when value is a usable finite number. */
export function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

/**
 * Format MAD/DH for Admin UI.
 * Invalid values → "0 DH" (or custom unavailable label when explicitly nullish intent).
 */
export function formatMoney(
  value: unknown,
  opts?: { locale?: "en" | "ar"; unavailable?: string },
): string {
  if (value === null || value === undefined) {
    return opts?.unavailable ?? "0 DH";
  }
  const n = safeNumber(value, Number.NaN);
  if (!Number.isFinite(n)) {
    return opts?.unavailable ?? "0 DH";
  }
  const rounded = Math.round(n);
  const formatted = rounded.toLocaleString(
    opts?.locale === "ar" ? "ar-MA" : "fr-MA",
  );
  return `${formatted} DH`;
}

/** Safe percent 0–100. Division by zero → 0. */
export function safePercent(numerator: unknown, denominator: unknown): number {
  const n = safeNumber(numerator);
  const d = safeNumber(denominator);
  if (d === 0) return 0;
  const pct = (n / d) * 100;
  if (!Number.isFinite(pct)) return 0;
  return Math.round(pct);
}

export function formatPercent(numerator: unknown, denominator: unknown): string {
  return `${safePercent(numerator, denominator)}%`;
}
