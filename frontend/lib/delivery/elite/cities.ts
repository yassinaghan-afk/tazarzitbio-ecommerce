/**
 * Map customer city name → Elite city ID (from GET /v1.0/cities).
 * Never invent IDs — unmatched cities return null.
 */

import type { EliteCity } from "@/lib/delivery/elite/client";

function normalizeCityName(raw: string): string {
  return raw
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[''`]/g, "")
    .replace(/[^a-z0-9\u0600-\u06ff]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Common Arabic / FR / EN aliases → Elite Latin names */
const CITY_ALIASES: Record<string, string> = {
  "الدار البيضاء": "casablanca",
  كازا: "casablanca",
  كازابلانكا: "casablanca",
  casa: "casablanca",
  الرباط: "rabat",
  مراكش: "marrakech",
  طنجة: "tanger",
  طنجه: "tanger",
  tangier: "tanger",
  أكادير: "agadir",
  اكادير: "agadir",
  فاس: "fes",
  fez: "fes",
  مكناس: "meknes",
  سلا: "sale",
  تمارة: "temara",
  القنيطرة: "kenitra",
  kenitra: "kenitra",
  وجدة: "oujda",
  تطوان: "tetouan",
  الناظور: "nador",
  أسفي: "safi",
  اسفي: "safi",
  المحمدية: "mohammedia",
  الجديدة: "el jadida",
  "el jadida": "el jadida",
  خريبكة: "khouribga",
  "بني ملال": "beni mellal",
  "beni mellal": "beni mellal",
  العيون: "laayoune",
  الداخلة: "dakhla",
};

export type CityMatch =
  | { ok: true; cityId: string; matchedName: string }
  | { ok: false; reason: "EMPTY" | "NOT_FOUND"; input: string };

export function resolveEliteCityId(
  customerCity: string | undefined | null,
  cities: EliteCity[],
): CityMatch {
  const input = (customerCity ?? "").trim();
  if (!input) return { ok: false, reason: "EMPTY", input };

  // Already an Elite numeric ID?
  if (/^\d+$/.test(input)) {
    const hit = cities.find((c) => c.id === input);
    if (hit) return { ok: true, cityId: hit.id, matchedName: hit.name };
  }

  const normalized = normalizeCityName(input);
  const aliased = CITY_ALIASES[normalized] ?? CITY_ALIASES[input] ?? normalized;

  // Exact normalized match
  for (const c of cities) {
    const n = normalizeCityName(c.name);
    if (n === aliased || n === normalized) {
      return { ok: true, cityId: c.id, matchedName: c.name };
    }
  }

  // Starts-with / contains (prefer shortest name to avoid wrong suburb)
  const candidates = cities
    .map((c) => ({ c, n: normalizeCityName(c.name) }))
    .filter(
      ({ n }) =>
        n === aliased ||
        n.startsWith(aliased) ||
        aliased.startsWith(n) ||
        n.includes(aliased) ||
        aliased.includes(n),
    )
    .sort((a, b) => a.n.length - b.n.length);

  // Require strong match: exact, or startsWith with length >= 4
  const strong = candidates.find(
    ({ n }) =>
      n === aliased ||
      n === normalized ||
      (aliased.length >= 4 && (n.startsWith(aliased) || aliased.startsWith(n))),
  );
  if (strong) {
    return { ok: true, cityId: strong.c.id, matchedName: strong.c.name };
  }

  return { ok: false, reason: "NOT_FOUND", input };
}
