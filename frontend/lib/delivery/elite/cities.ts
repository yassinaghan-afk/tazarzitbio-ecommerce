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
  casablanca: "casablanca",
  الرباط: "rabat",
  rabat: "rabat",
  مراكش: "marrakech",
  marrakech: "marrakech",
  marrakesh: "marrakech",
  طنجة: "tanger",
  طنجه: "tanger",
  tangier: "tanger",
  tanger: "tanger",
  أكادير: "agadir",
  اكادير: "agadir",
  agadir: "agadir",
  فاس: "fes",
  fez: "fes",
  fes: "fes",
  مكناس: "meknes",
  meknes: "meknes",
  سلا: "sale",
  sale: "sale",
  تمارة: "temara",
  temara: "temara",
  القنيطرة: "kenitra",
  قنيطرة: "kenitra",
  kenitra: "kenitra",
  وجدة: "oujda",
  oujda: "oujda",
  تطوان: "tetouan",
  tetouan: "tetouan",
  "tétouan": "tetouan",
  الناظور: "nador",
  nador: "nador",
  أسفي: "safi",
  اسفي: "safi",
  safi: "safi",
  المحمدية: "mohammedia",
  mohammedia: "mohammedia",
  الجديدة: "el jadida",
  "el jadida": "el jadida",
  خريبكة: "khouribga",
  khouribga: "khouribga",
  "بني ملال": "beni mellal",
  "beni mellal": "beni mellal",
  العيون: "laayoune",
  laayoune: "laayoune",
  الداخلة: "dakhla",
  dakhla: "dakhla",
  ورزازات: "ouarzazate",
  ouarzazate: "ouarzazate",
  الحسيمة: "alhoceima",
  "al hoceima": "alhoceima",
  تارودانت: "taroudant",
  taroudant: "taroudant",
  إنزكان: "inezgane",
  انزكان: "inezgane",
  inezgane: "inezgane",
  "آيت ملول": "ait melloul",
  "ait melloul": "ait melloul",
  تيزنيت: "tiznit",
  tiznit: "tiznit",
  الصويرة: "essaouira",
  essaouira: "essaouira",
  خنيفرة: "khenifra",
  برشيد: "berrechid",
  سطات: "settat",
  settat: "settat",
  تاوريرت: "taourirt",
  جرسيف: "guercif",
  "الفقيه بن صالح": "fquih ben salah",
  اليوسفية: "youssoufia",
  "سيدي سليمان": "sidi slimane",
  "سيدي قاسم": "sidi kacem",
  العرائش: "larache",
  larache: "larache",
  شفشاون: "chefchaouen",
  chefchaouen: "chefchaouen",
  ميدلت: "midelt",
  الراشيدية: "errachidia",
  errachidia: "errachidia",
  زاكورة: "zagora",
  طانطان: "tantan",
  كلميم: "guelmim",
  بوجدور: "boujdour",
  السمارة: "smara",
};

export type CityMatch =
  | { ok: true; cityId: string; matchedName: string }
  | { ok: false; reason: "EMPTY" | "NOT_FOUND"; input: string };

function matchNormalized(
  normalized: string,
  aliased: string,
  cities: EliteCity[],
): CityMatch | null {
  for (const c of cities) {
    const n = normalizeCityName(c.name);
    if (n === aliased || n === normalized) {
      return { ok: true, cityId: c.id, matchedName: c.name };
    }
  }

  const candidates = cities
    .map((c) => ({ c, n: normalizeCityName(c.name) }))
    .filter(
      ({ n }) =>
        n === aliased ||
        n === normalized ||
        n.startsWith(aliased) ||
        aliased.startsWith(n) ||
        n.includes(aliased) ||
        aliased.includes(n),
    )
    .sort((a, b) => a.n.length - b.n.length);

  const strong = candidates.find(
    ({ n }) =>
      n === aliased ||
      n === normalized ||
      (aliased.length >= 4 && (n.startsWith(aliased) || aliased.startsWith(n))),
  );
  if (strong) {
    return { ok: true, cityId: strong.c.id, matchedName: strong.c.name };
  }
  return null;
}

export function resolveEliteCityId(
  customerCity: string | undefined | null,
  cities: EliteCity[],
): CityMatch {
  const input = (customerCity ?? "").trim();
  if (!input) return { ok: false, reason: "EMPTY", input };

  if (/^\d+$/.test(input)) {
    const hit = cities.find((c) => c.id === input);
    if (hit) return { ok: true, cityId: hit.id, matchedName: hit.name };
  }

  const normalized = normalizeCityName(input);
  const aliased = CITY_ALIASES[normalized] ?? CITY_ALIASES[input] ?? normalized;
  const hit = matchNormalized(normalized, aliased, cities);
  if (hit) return hit;

  return { ok: false, reason: "NOT_FOUND", input };
}

/**
 * Resolve Elite city from dedicated city field, otherwise scan address text
 * (royal / ads checkouts often put the city only inside the address).
 */
export function resolveEliteCityForOrder(
  city: string | undefined | null,
  address: string | undefined | null,
  cities: EliteCity[],
): CityMatch {
  const direct = resolveEliteCityId(city, cities);
  if (direct.ok) return direct;

  const text = (address ?? "").trim();
  if (!text) {
    return city?.trim()
      ? { ok: false, reason: "NOT_FOUND", input: city.trim() }
      : { ok: false, reason: "EMPTY", input: "" };
  }

  const asCity = resolveEliteCityId(text, cities);
  if (asCity.ok) return asCity;

  const aliasEntries = Object.entries(CITY_ALIASES).sort(
    (a, b) => b[0].length - a[0].length,
  );
  const normalizedText = normalizeCityName(text);
  for (const [alias, target] of aliasEntries) {
    const nAlias = normalizeCityName(alias);
    if (
      nAlias.length >= 3 &&
      (normalizedText.includes(nAlias) || text.includes(alias))
    ) {
      const hit = matchNormalized(nAlias, target, cities);
      if (hit) return hit;
    }
  }

  const byName = [...cities]
    .map((c) => ({ c, n: normalizeCityName(c.name) }))
    .filter(({ n }) => n.length >= 3 && normalizedText.includes(n))
    .sort((a, b) => b.n.length - a.n.length);
  if (byName[0]) {
    return {
      ok: true,
      cityId: byName[0].c.id,
      matchedName: byName[0].c.name,
    };
  }

  const tokens = text
    .split(/[\s,،/\-|_]+/)
    .map((t) => t.trim())
    .filter((t) => t.length >= 3);
  for (const token of tokens) {
    const hit = resolveEliteCityId(token, cities);
    if (hit.ok) return hit;
  }

  return {
    ok: false,
    reason: "NOT_FOUND",
    input: (city ?? "").trim() || text.slice(0, 80),
  };
}
