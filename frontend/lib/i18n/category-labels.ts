import type { ProductCategory } from "@/lib/products/types";

import { translate, type TranslationKey } from "./translations";
import type { Language } from "./types";

const CATEGORY_KEYS: Record<Exclude<ProductCategory, "all">, TranslationKey> =
  {
    honey: "category.honey",
    amlou: "category.amlou",
    bundles: "category.bundles",
    oils: "category.oils",
    "honey-nuts": "category.honeyNuts",
  };

export function getCategoryLabel(
  category: ProductCategory,
  locale: Language,
): string {
  if (category === "all") return translate(locale, "category.all");
  const key = CATEGORY_KEYS[category];
  return key ? translate(locale, key) : category;
}

export function getDefaultCategoryFilters(locale: Language) {
  const categories = [
    "all",
    "honey",
    "amlou",
    "bundles",
    "oils",
    "honey-nuts",
  ] as const satisfies readonly ProductCategory[];

  return categories.map((id) => ({
    id,
    label: getCategoryLabel(id, locale),
  }));
}
