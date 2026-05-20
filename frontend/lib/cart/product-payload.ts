import type { AddToCartPayload } from "@/lib/cart/types";
import type { PublicProduct, PublicProductOffer } from "@/lib/products/types";

export function getDefaultOffer(
  product: PublicProduct,
): PublicProductOffer {
  const popular = product.offers.find((o) => o.hint);
  if (popular) return popular;
  if (product.offers.length === 1) return product.offers[0];
  return product.offers[1] ?? product.offers[0];
}

export function buildAddToCartPayload(
  product: PublicProduct,
  offer: PublicProductOffer,
  options?: { quantity?: number; openDrawer?: AddToCartPayload["openDrawer"] },
): AddToCartPayload {
  return {
    productId: product.id,
    slug: product.slug,
    nameAr: product.nameAr,
    image: product.image,
    offerId: offer.id,
    offerLabel: `${offer.label} — ${offer.weight}`,
    unitPrice: offer.price,
    quantity: options?.quantity ?? 1,
    isBundle: product.category === "bundles",
    openDrawer: options?.openDrawer ?? "cart",
  };
}
