import type { CmsProductRecord } from "@/lib/admin/product-types";
import type { PricingOverrides } from "@/lib/products/admin-storage";
import { buildCatalog } from "@/lib/products/catalog-base";
import { buildPricingEconomics } from "@/lib/products/pricing";
import type { Product, ProductBadge, ProductOffer } from "@/lib/products/types";
import { readStore } from "@/lib/server/store";

export interface CmsCatalogState {
  cmsProducts: CmsProductRecord[];
  hiddenCatalogIds: string[];
  featuredProductSlugs: string[];
  productOrder: string[];
  pricingOverrides: PricingOverrides;
}

export async function loadCmsCatalogState(): Promise<CmsCatalogState> {
  const store = await readStore();
  return {
    cmsProducts: store.cmsProducts ?? [],
    hiddenCatalogIds: store.hiddenCatalogIds ?? [],
    featuredProductSlugs: store.featuredProductSlugs ?? [],
    productOrder: store.productOrder ?? [],
    pricingOverrides: store.pricingOverrides ?? {},
  };
}

function cmsOffersToProductOffers(offers: CmsProductRecord["offers"]): ProductOffer[] {
  return offers.map((o) => ({
    id: o.id,
    sku: o.sku || o.id,
    label: o.label,
    weight: o.weight,
    hint: o.hint,
    economics: buildPricingEconomics({
      costPrice: o.costPrice,
      salePrice: o.salePrice,
    }),
  }));
}

function cmsRecordToProduct(record: CmsProductRecord): Product {
  const offers = cmsOffersToProductOffers(record.offers);
  const price = offers.length
    ? Math.min(...offers.map((o) => o.economics.salePrice))
    : 0;
  const badges: ProductBadge[] = [...record.badges];
  if (record.isBestseller && !badges.includes("bestseller")) {
    badges.push("bestseller");
  }

  return {
    id: record.id,
    slug: record.slug,
    nameAr: record.nameAr,
    shortDescription: record.shortDescription,
    description: record.description,
    price,
    image: record.images[0] ?? "/images/products/placeholder.png",
    images: record.images.length ? record.images : ["/images/products/placeholder.png"],
    category: record.category,
    badges,
    weight: offers.map((o) => o.weight).join(" — ") || undefined,
    ingredients: record.ingredients,
    benefits: record.benefits,
    usageSuggestions: record.usageSuggestions,
    offers,
    faq: [],
    reviews: [],
    rating: 4.8,
    reviewCount: 0,
    relatedSlugs: [],
  };
}

function mergeCatalogProduct(base: Product, override: CmsProductRecord): Product {
  const offers =
    override.offers.length > 0
      ? cmsOffersToProductOffers(override.offers)
      : base.offers;

  const badges: ProductBadge[] =
    override.badges.length > 0 ? [...override.badges] : [...base.badges];
  if (override.isBestseller && !badges.includes("bestseller")) {
    badges.push("bestseller");
  }

  return {
    ...base,
    slug: override.slug || base.slug,
    nameAr: override.nameAr || base.nameAr,
    shortDescription: override.shortDescription || base.shortDescription,
    description: override.description || base.description,
    images: override.images.length ? override.images : base.images,
    image: override.images[0] ?? base.image,
    category: override.category || base.category,
    badges,
    ingredients: override.ingredients.length ? override.ingredients : base.ingredients,
    benefits: override.benefits.length ? override.benefits : base.benefits,
    usageSuggestions: override.usageSuggestions.length
      ? override.usageSuggestions
      : base.usageSuggestions,
    offers,
    price: offers.length
      ? Math.min(...offers.map((o) => o.economics.salePrice))
      : base.price,
  };
}

function sortProducts(products: Product[], order: string[]): Product[] {
  if (!order.length) return products;
  const rank = new Map(order.map((id, i) => [id, i]));
  return [...products].sort((a, b) => {
    const ra = rank.get(a.id) ?? 9999;
    const rb = rank.get(b.id) ?? 9999;
    return ra - rb;
  });
}

export function buildMergedCatalog(state: CmsCatalogState): Product[] {
  const base = buildCatalog(state.pricingOverrides);
  const hidden = new Set(state.hiddenCatalogIds);
  const overridesById = new Map(
    state.cmsProducts.filter((p) => p.source === "catalog").map((p) => [p.id, p]),
  );
  const custom = state.cmsProducts.filter(
    (p) => p.source === "custom" && p.isVisible,
  );

  const seenBaseIds = new Set<string>();
  const merged: Product[] = [];

  for (const product of base) {
    if (seenBaseIds.has(product.id)) continue;
    seenBaseIds.add(product.id);

    const override = overridesById.get(product.id);
    if (hidden.has(product.id) || override?.isVisible === false) continue;

    merged.push(override ? mergeCatalogProduct(product, override) : product);
  }

  for (const record of custom) {
    if (!record.isVisible) continue;
    merged.push(cmsRecordToProduct(record));
  }

  return sortProducts(merged, state.productOrder);
}

export async function getMergedCatalog(): Promise<Product[]> {
  const state = await loadCmsCatalogState();
  return buildMergedCatalog(state);
}

export async function getMergedProductBySlug(slug: string): Promise<Product | undefined> {
  const catalog = await getMergedCatalog();
  return catalog.find((p) => p.slug === slug);
}
