import type { PublicProduct } from "./types";

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
    (p) => !isExpandedVariantRow(p) && !exclude.has(p.slug),
  );
}
