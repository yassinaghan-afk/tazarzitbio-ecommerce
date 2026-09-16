import { AMLOU_ROYAL_SLUG } from "./amlou-royal";
import { FAMILY_PACK_SLUG } from "@/lib/brand";
import type { PublicProduct } from "./types";

/** Removed from storefront catalog and shop grids */
export const REMOVED_PRODUCT_SLUGS = [FAMILY_PACK_SLUG] as const;

/** No longer landing-only — Amlou Royal appears in shop/home with dedicated /amlouroyal PDP */
export const LANDING_ONLY_SLUGS = [] as const;

export function isLandingOnlyProduct(
  product: Pick<PublicProduct, "slug">,
): boolean {
  return (LANDING_ONLY_SLUGS as readonly string[]).includes(product.slug);
}

export function isRemovedProduct(
  product: Pick<PublicProduct, "slug">,
): boolean {
  return (REMOVED_PRODUCT_SLUGS as readonly string[]).includes(product.slug);
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
      !isRemovedProduct(p) &&
      p.category !== "bundles" &&
      !exclude.has(p.slug),
  );
}

/** Prefer Amlou Royal first in home “best sellers” grids */
export function sortListingForHome(
  products: PublicProduct[],
): PublicProduct[] {
  return [...products].sort((a, b) => {
    if (a.slug === AMLOU_ROYAL_SLUG) return -1;
    if (b.slug === AMLOU_ROYAL_SLUG) return 1;
    return 0;
  });
}
