import { AMLOU_ROYAL_SLUG } from "./amlou-royal";
import type { PublicProduct } from "./types";

/** Dedicated landing pages — keep shop/home grids unchanged */
export const LANDING_ONLY_SLUGS = [AMLOU_ROYAL_SLUG] as const;

export function isLandingOnlyProduct(
  product: Pick<PublicProduct, "slug">,
): boolean {
  return (LANDING_ONLY_SLUGS as readonly string[]).includes(product.slug);
}

/** SEO variant rows and slug aliases — not shown in shop grids */
export function isExpandedVariantRow(
  product: Pick<PublicProduct, "id" | "slug">,
): boolean {
  return product.id.includes("--") || product.slug === "mixed-nuts";
}

export interface ListingProductsOptions {
  excludeSlugs?: string[];
}

/** Parent products only — one card per product in grids */
export function getListingProducts(
  products: PublicProduct[],
  options?: ListingProductsOptions,
): PublicProduct[] {
  const exclude = new Set(options?.excludeSlugs ?? []);
  return products.filter(
    (p) =>
      !isExpandedVariantRow(p) &&
      !isLandingOnlyProduct(p) &&
      !exclude.has(p.slug),
  );
}
