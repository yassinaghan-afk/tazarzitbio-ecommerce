export interface CheckoutFormData {
  fullName: string;
  phone: string;
  address: string;
}

export interface CheckoutFormErrors {
  fullName?: string;
  phone?: string;
  address?: string;
}

export interface PlacedOrder {
  id: string;
  placedAt: string;
  customer: CheckoutFormData;
  items: {
    nameAr: string;
    offerLabel: string;
    quantity: number;
    unitPrice: number;
  }[];
  subtotal: number;
  shippingFee: number;
  total: number;
  shippingLabelFr: string;
}

export const LAST_ORDER_STORAGE_KEY = "tazarzit-last-order";
