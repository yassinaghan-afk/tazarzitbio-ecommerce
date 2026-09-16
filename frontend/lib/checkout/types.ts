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
    slug?: string;
    productId?: string;
    isUpsell?: boolean;
  }[];
  subtotal: number;
  shippingFee: number;
  total: number;
  shippingLabelFr: string;
  shippingLabelAr?: string;
  /** Required to mutate order on /upsell */
  upsellToken?: string;
  /** When true, /upsell redirects to thank-you */
  upsellCompleted?: boolean;
  /** Thank-you destination after upsell */
  thankYouPath?: "/thank-you" | "/royal/thank-you" | "/royalfr/thank-you";
}

export const LAST_ORDER_STORAGE_KEY = "tazarzit-last-order";
export const UPSELL_SELECTION_STORAGE_PREFIX = "tazarzit-upsell-selection:";
