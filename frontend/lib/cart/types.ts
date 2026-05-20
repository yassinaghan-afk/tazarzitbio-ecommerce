export interface CartLineItem {
  lineId: string;
  productId: string;
  slug: string;
  nameAr: string;
  image: string;
  offerId: string;
  offerLabel: string;
  unitPrice: number;
  quantity: number;
  /** Bundle/pack products qualify for free shipping */
  isBundle?: boolean;
}

export interface CartState {
  items: CartLineItem[];
}

export interface AddToCartPayload {
  productId: string;
  slug: string;
  nameAr: string;
  image: string;
  offerId: string;
  offerLabel: string;
  unitPrice: number;
  quantity?: number;
  isBundle?: boolean;
}
