/** Normalize Moroccan phone numbers for CRM deduplication. */
export function normalizeMoroccanPhone(raw: string): string {
  let digits = raw.replace(/\D/g, "");
  if (digits.startsWith("212")) digits = digits.slice(3);
  if (digits.startsWith("0")) digits = digits.slice(1);
  // Keep last 9 digits when longer (local mobile length)
  if (digits.length > 9) digits = digits.slice(-9);
  return digits;
}

export function phonesMatch(a: string, b: string): boolean {
  const na = normalizeMoroccanPhone(a);
  const nb = normalizeMoroccanPhone(b);
  if (!na || !nb) return false;
  return na === nb;
}
