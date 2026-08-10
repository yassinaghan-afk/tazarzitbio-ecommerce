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
