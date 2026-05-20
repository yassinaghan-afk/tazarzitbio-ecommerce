export type PaymentMethod = "COD";

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "shipped"
  | "delivered"
  | "cancelled";

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
  products: OrderLineItem[];
  subtotal: number;
  shippingPrice: number;
  total: number;
  paymentMethod: PaymentMethod;
  orderStatus: OrderStatus;
  createdAt: string; // ISO
}

export interface CreateOrderInput {
  customerName: string;
  phone: string;
  address: string;
  products: OrderLineItem[];
  subtotal: number;
  shippingPrice: number;
  total: number;
}

export interface CreateOrderResponse {
  order: OrderRecord;
}

export const ORDER_STATUSES: { id: OrderStatus; labelAr: string }[] = [
  { id: "pending", labelAr: "قيد المراجعة" },
  { id: "confirmed", labelAr: "مؤكد" },
  { id: "shipped", labelAr: "تم الشحن" },
  { id: "delivered", labelAr: "تم التسليم" },
  { id: "cancelled", labelAr: "ملغي" },
];

