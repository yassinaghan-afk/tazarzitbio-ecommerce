import { loadPricingOverrides } from "./admin-storage";
import { buildCatalog, baseCatalog } from "./catalog-base";
import type { PricingOverrides } from "./admin-storage";
import { isExpandedVariantRow } from "./listing";
import type { Product, PublicProduct, PublicProductOffer } from "./types";

export function getCatalog(overrides?: PricingOverrides): Product[] {
  return buildCatalog(overrides);
}

export function getProducts(): Product[] {
  if (typeof window !== "undefined") {
    return buildCatalog(loadPricingOverrides());
  }
  return baseCatalog;
}

export function toPublicOffer(offer: Product["offers"][number]): PublicProductOffer {
  return {
    id: offer.id,
    label: offer.label,
    weight: offer.weight,
    hint: offer.hint,
    price: offer.economics.salePrice,
  };
}

export function toPublicProduct(product: Product): PublicProduct {
  const offers = product.offers.map(toPublicOffer);
  return {
    ...product,
    price: Math.min(...offers.map((o) => o.price)),
    offers,
  };
}

export function getPublicProducts(): PublicProduct[] {
  return getProducts().map(toPublicProduct);
}

export function getProductBySlug(slug: string): Product | undefined {
  return getProducts().find((p) => p.slug === slug);
}

export function getPublicProductBySlug(slug: string): PublicProduct | undefined {
  const p = getProductBySlug(slug);
  return p ? toPublicProduct(p) : undefined;
}

export function getProductsByCategory(
  category: import("./types").ProductCategory,
): PublicProduct[] {
  const list =
    category === "all"
      ? getPublicProducts()
      : getPublicProducts().filter((p) => p.category === category);
  return list;
}

export function getRelatedProducts(slugs: string[]): PublicProduct[] {
  return slugs
    .map((slug) => getPublicProductBySlug(slug))
    .filter(
      (p): p is PublicProduct => Boolean(p && !isExpandedVariantRow(p)),
    );
}

/** All variant rows for admin */
export function getAllVariants(catalog?: Product[]) {
  const list = catalog ?? getProducts();
  return list.flatMap((product) =>
    product.offers.map((offer) => ({
      productId: product.id,
      productName: product.nameAr,
      slug: product.slug,
      variantId: offer.id,
      sku: offer.sku,
      label: offer.label,
      weight: offer.weight,
      economics: offer.economics,
    })),
  );
}

export { baseCatalog, buildCatalog };
