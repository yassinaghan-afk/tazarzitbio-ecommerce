export type PaymentMethod = "COD";

export type OrderStatus =
  | "pending"
  | "contacted"
  | "confirmed"
  | "preparing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "returned";

export interface OrderLineItem {
  productId: string;
  slug: string;
  nameAr: string;
  image: string;
  offerId: string;
  offerLabel: string;
  unitPrice: number;
  quantity: number;
  isBundle?: boolean;
  /** Post-purchase upsell line — excluded from "original" product set */
  isUpsell?: boolean;
  /** Catalog list price before upsell discount (upsell lines only) */
  listUnitPrice?: number;
  /** Display size/weight from catalog offer (e.g. 250g, 500ml) */
  weight?: string;
}

export interface OrderRecord {
  orderId: string;
  customerName: string;
  phone: string;
  address: string;
  city?: string;
  products: OrderLineItem[];
  subtotal: number;
  shippingPrice: number;
  /** MAD discount applied via coupon (0 or absent = none) */
  discount?: number;
  couponCode?: string;
  total: number;
  paymentMethod: PaymentMethod;
  orderStatus: OrderStatus;
  /** internal note visible only to admins */
  adminNote?: string;
  /** note about/from the customer */
  customerNote?: string;
  /** page the order came from (referer) */
  source?: string;
  createdAt: string; // ISO
  /** Secret token required to attach post-purchase upsell items */
  upsellToken?: string;
  /** Once true, upsell product mutations are locked (finalize may still retry export) */
  upsellCompleted?: boolean;
  /** Idempotency: order already written to Google Sheets */
  sheetsExported?: boolean;
  sheetsExportedAt?: string;
}

export interface CreateOrderInput {
  customerName: string;
  phone: string;
  address: string;
  city?: string;
  products: OrderLineItem[];
  subtotal: number;
  shippingPrice: number;
  total: number;
  couponCode?: string;
  customerNote?: string;
}

export interface CreateOrderResponse {
  order: OrderRecord;
  /** Shared Meta Pixel + CAPI event_id for Purchase deduplication */
  meta?: {
    purchaseEventId: string;
    /** Present when upsell flow is available for this order */
    upsellToken?: string;
  };
}

export interface UpsellItemInput {
  productId: string;
  offerId?: string;
  quantity: number;
}

export interface UpsellOrderResponse {
  order: OrderRecord;
  upsellCompleted: boolean;
  /** False when Sheets export failed — client must retry, not redirect to thank-you */
  exportOk?: boolean;
  meta?: { purchaseEventId: string };
}

export const ORDER_STATUSES: { id: OrderStatus; labelAr: string; label: string }[] = [
  { id: "pending", labelAr: "قيد المراجعة", label: "New" },
  { id: "contacted", labelAr: "تم الاتصال", label: "Contacted" },
  { id: "confirmed", labelAr: "مؤكد", label: "Confirmed" },
  { id: "preparing", labelAr: "قيد التحضير", label: "Preparing" },
  { id: "shipped", labelAr: "تم الشحن", label: "Shipped" },
  { id: "delivered", labelAr: "تم التسليم", label: "Delivered" },
  { id: "cancelled", labelAr: "ملغي", label: "Cancelled" },
  { id: "returned", labelAr: "مرتجع", label: "Returned" },
];

export const ORDER_STATUS_IDS = ORDER_STATUSES.map((s) => s.id);
