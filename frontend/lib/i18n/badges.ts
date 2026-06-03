import type { ProductBadge } from "@/lib/products/types";

import { translate, type TranslationKey } from "./translations";
import type { Language } from "./types";

const BADGE_KEYS: Record<ProductBadge, TranslationKey> = {
  bestseller: "badge.bestseller",
  new: "badge.new",
  natural: "badge.natural",
  limited: "badge.limited",
};

export function getBadgeLabel(badge: ProductBadge, locale: Language): string {
  return translate(locale, BADGE_KEYS[badge]);
}
