import type { PublicProduct, PublicProductOffer } from "@/lib/products/types";

/** French display names for catalog products shown on /royalfr upsell. */
export const FR_PRODUCT_NAMES: Record<string, string> = {
  "almond-amlou": "Amlou aux amandes",
  "pistachio-amlou": "Amlou à la pistache",
  "argan-oil": "Huile d'argan marocaine",
  "mixed-nuts-honey": "Fruits secs au miel",
  "daghmous-honey": "Miel de Daghmous",
  "saatar-honey": "Miel de thym",
  "eucalyptus-honey": "Miel d'eucalyptus",
  "cocoa-amlou": "Amlou cacao",
  "amlou-royal": "Amlou Royal",
};

const FR_HINTS: Record<string, string> = {
  "الأكثر طلباً": "Le plus demandé",
  "قيمة عائلية": "Valeur familiale",
};

/** Convert Arabic weight/volume units to French (g / ml / kg). */
export function toFrenchWeightLabel(raw: string): string {
  // Replace كغ before غ — otherwise "كغ" becomes "ك g".
  return raw
    .replace(/\u00a0/g, " ")
    .replace(/\s*كغ\s*/g, " kg")
    .replace(/\s*مل\s*/g, " ml")
    .replace(/\s*غ\s*/g, " g")
    .replace(/\s*—\s*/g, " — ")
    .replace(/\s+/g, " ")
    .trim();
}

export function frenchProductName(product: Pick<PublicProduct, "id" | "slug" | "nameAr">): string {
  return (
    FR_PRODUCT_NAMES[product.slug] ||
    FR_PRODUCT_NAMES[product.id] ||
    product.nameAr
  );
}

export function frenchOfferLabel(offer: PublicProductOffer): string {
  const base = toFrenchWeightLabel(offer.weight || offer.label);
  const hint = offer.hint ? FR_HINTS[offer.hint] || offer.hint : "";
  return hint ? `${base} · ${hint}` : base;
}

export function frenchOfferHint(hint?: string): string | undefined {
  if (!hint) return undefined;
  return FR_HINTS[hint] || toFrenchWeightLabel(hint);
}
