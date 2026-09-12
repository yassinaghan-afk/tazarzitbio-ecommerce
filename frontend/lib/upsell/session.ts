import type { PlacedOrder } from "@/lib/checkout/types";
import {
  LAST_ORDER_STORAGE_KEY,
  UPSELL_SELECTION_STORAGE_PREFIX,
} from "@/lib/checkout/types";
import type { OrderRecord } from "@/lib/orders/types";

export type UpsellSelection = {
  productId: string;
  offerId: string;
  quantity: number;
  nameAr: string;
  image: string;
  unitPrice: number;
  listUnitPrice?: number;
  offerLabel: string;
  slug: string;
  weight?: string;
};

export function readPlacedOrder(): PlacedOrder | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(LAST_ORDER_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PlacedOrder;
  } catch {
    return null;
  }
}

export function writePlacedOrder(order: PlacedOrder): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(LAST_ORDER_STORAGE_KEY, JSON.stringify(order));
  } catch {
    /* ignore */
  }
}

export function readUpsellSelection(orderId: string): UpsellSelection[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = sessionStorage.getItem(`${UPSELL_SELECTION_STORAGE_PREFIX}${orderId}`);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as UpsellSelection[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeUpsellSelection(orderId: string, items: UpsellSelection[]): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(
      `${UPSELL_SELECTION_STORAGE_PREFIX}${orderId}`,
      JSON.stringify(items),
    );
  } catch {
    /* ignore */
  }
}

export function clearUpsellSelection(orderId: string): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(`${UPSELL_SELECTION_STORAGE_PREFIX}${orderId}`);
  } catch {
    /* ignore */
  }
}

export function placedOrderFromApiOrder(
  order: OrderRecord,
  previous?: PlacedOrder | null,
): PlacedOrder {
  return {
    id: order.orderId,
    placedAt: order.createdAt,
    customer: previous?.customer ?? {
      fullName: order.customerName,
      phone: order.phone,
      address: order.address,
    },
    items: order.products.map((p) => ({
      nameAr: p.nameAr,
      offerLabel: p.offerLabel,
      quantity: p.quantity,
      unitPrice: p.unitPrice,
      slug: p.slug,
      productId: p.productId,
      isUpsell: p.isUpsell,
    })),
    subtotal: order.subtotal,
    shippingFee: order.shippingPrice,
    total: order.total,
    shippingLabelFr:
      order.shippingPrice === 0
        ? "Livraison gratuite"
        : `Frais de livraison: ${order.shippingPrice} MAD`,
    shippingLabelAr:
      order.shippingPrice === 0
        ? "التوصيل مجاناً"
        : `+ ${order.shippingPrice} درهم توصيل`,
    upsellToken: order.upsellToken ?? previous?.upsellToken,
    upsellCompleted: order.upsellCompleted,
    thankYouPath: previous?.thankYouPath ?? "/thank-you",
  };
}

export function withSearch(path: string): string {
  if (typeof window === "undefined") return path;
  const q = window.location.search;
  if (!q || q === "?") return path;
  return path.includes("?") ? `${path}&${q.slice(1)}` : `${path}${q}`;
}
