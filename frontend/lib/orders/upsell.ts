import type { OrderLineItem, OrderRecord } from "@/lib/orders/types";
import { getMergedCatalog } from "@/lib/products/cms-catalog";
import { isExpandedVariantRow, isLandingOnlyProduct } from "@/lib/products/listing";
import type { Product } from "@/lib/products/types";

export function sumLineItems(products: OrderLineItem[]): number {
  return products.reduce((sum, p) => sum + p.unitPrice * p.quantity, 0);
}

export function recomputeOrderTotals(order: OrderRecord): OrderRecord {
  const subtotal = sumLineItems(order.products);
  const discount = order.discount ?? 0;
  const shippingPrice = order.shippingPrice;
  const total = Math.max(0, subtotal - discount + shippingPrice);
  return {
    ...order,
    subtotal,
    total,
  };
}

export function splitOrderProducts(products: OrderLineItem[]): {
  original: OrderLineItem[];
  upsell: OrderLineItem[];
} {
  const original: OrderLineItem[] = [];
  const upsell: OrderLineItem[] = [];
  for (const line of products) {
    if (line.isUpsell) upsell.push(line);
    else original.push(line);
  }
  return { original, upsell };
}

/** Resolve catalog product + offer and build a priced upsell line (server-side only). */
export async function buildUpsellLine(input: {
  productId: string;
  offerId?: string;
  quantity: number;
  excludeProductIds?: Set<string>;
}): Promise<OrderLineItem | { error: string }> {
  const qty = Math.floor(input.quantity);
  if (!Number.isFinite(qty) || qty < 1 || qty > 20) {
    return { error: "Invalid quantity" };
  }

  const catalog = await getMergedCatalog();
  const product = catalog.find((p) => p.id === input.productId);
  if (!product) {
    return { error: "Product not found" };
  }
  if (isExpandedVariantRow(product) || isLandingOnlyProduct(product)) {
    return { error: "Product unavailable" };
  }
  if (input.excludeProductIds?.has(product.id)) {
    return { error: "Product already in order" };
  }

  const offer = resolveOffer(product, input.offerId);
  if (!offer) {
    return { error: "Offer unavailable" };
  }

  const unitPrice = offer.economics.salePrice;
  if (!Number.isFinite(unitPrice) || unitPrice <= 0) {
    return { error: "Invalid price" };
  }

  return {
    productId: product.id,
    slug: product.slug,
    nameAr: product.nameAr,
    image: product.image,
    offerId: offer.id,
    offerLabel: offer.label,
    unitPrice,
    quantity: qty,
    isBundle: product.category === "bundles",
    isUpsell: true,
  };
}

function resolveOffer(product: Product, offerId?: string) {
  if (offerId) {
    return product.offers.find((o) => o.id === offerId) ?? null;
  }
  // Default to lowest sale price offer
  return [...product.offers].sort(
    (a, b) => a.economics.salePrice - b.economics.salePrice,
  )[0] ?? null;
}
