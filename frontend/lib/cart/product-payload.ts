import type { AddToCartPayload } from "@/lib/cart/types";
import { getProducts } from "@/lib/products/catalog";
import type { PublicProduct, PublicProductOffer } from "@/lib/products/types";

/** Smallest / entry variant — always the first offer (250g) in catalog */
export function getStartingOffer(product: PublicProduct): PublicProductOffer {
  return product.offers[0];
}

/** @deprecated Use getStartingOffer for listing cards */
export function getDefaultOffer(product: PublicProduct): PublicProductOffer {
  return getStartingOffer(product);
}

function getBaseProductName(nameAr: string): string {
  const dash = nameAr.indexOf(" — ");
  return dash >= 0 ? nameAr.slice(0, dash) : nameAr;
}

function resolveParentRef(product: PublicProduct): {
  productId: string;
  slug: string;
  nameAr: string;
} {
  if (!product.id.includes("--")) {
    return {
      productId: product.id,
      slug: product.slug,
      nameAr: getBaseProductName(product.nameAr),
    };
  }

  const parentId = product.id.split("--")[0]!;
  const parent = getProducts().find((p) => p.id === parentId);
  return {
    productId: parentId,
    slug: parent?.slug ?? product.slug,
    nameAr: parent?.nameAr ?? getBaseProductName(product.nameAr),
  };
}

export function buildAddToCartPayload(
  product: PublicProduct,
  offer: PublicProductOffer,
  options?: { quantity?: number; openDrawer?: AddToCartPayload["openDrawer"] },
): AddToCartPayload {
  const parent = resolveParentRef(product);

  return {
    productId: parent.productId,
    slug: parent.slug,
    nameAr: `${parent.nameAr} — ${offer.label}`,
    image: product.image,
    offerId: offer.id,
    offerLabel: offer.label,
    unitPrice: offer.price,
    quantity: options?.quantity ?? 1,
    isBundle: product.category === "bundles",
    openDrawer: options?.openDrawer ?? "cart",
  };
}
