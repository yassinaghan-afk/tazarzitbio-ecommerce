import { getPublicProductBySlug } from "./catalog";
import type { PublicProduct } from "./types";

/** Parent honey products eligible for checkout/cart upsell */
export const HONEY_UPSELL_SLUGS = [
  "daghmous-honey",
  "saatar-honey",
  "eucalyptus-honey",
] as const;

export type HoneyUpsellSlug = (typeof HONEY_UPSELL_SLUGS)[number];

export const HONEY_UPSELL_MAX = 2;

export function isHoneyUpsellSlug(slug: string): slug is HoneyUpsellSlug {
  return (HONEY_UPSELL_SLUGS as readonly string[]).includes(slug);
}

/** Map cart/order slug to parent honey slug (handles variant rows) */
export function resolveHoneyParentSlug(slug: string): HoneyUpsellSlug | null {
  if (isHoneyUpsellSlug(slug)) return slug;
  for (const honeySlug of HONEY_UPSELL_SLUGS) {
    if (slug.startsWith(`${honeySlug}-`)) return honeySlug;
  }
  return null;
}

function honeySlugsInCart(cartSlugs: string[]): Set<HoneyUpsellSlug> {
  const found = new Set<HoneyUpsellSlug>();
  for (const slug of cartSlugs) {
    const parent = resolveHoneyParentSlug(slug);
    if (parent) found.add(parent);
  }
  return found;
}

/**
 * Honey-only upsell recommendations.
 * Excludes honeys already in cart/order; max 2; never includes amlou or bundles.
 */
export function getHoneyUpsellRecommendations(
  cartOrOrderSlugs: string[],
  max = HONEY_UPSELL_MAX,
): PublicProduct[] {
  const inCart = honeySlugsInCart(cartOrOrderSlugs);

  const available = HONEY_UPSELL_SLUGS.filter((slug) => !inCart.has(slug));

  return available
    .slice(0, max)
    .map((slug) => getPublicProductBySlug(slug))
    .filter((p): p is PublicProduct => Boolean(p));
}
