import type { PricingEconomics } from "./pricing";

export type ProductCategory =
  | "all"
  | "bundles"
  | "amlou"
  | "honey"
  | "oils"
  | "honey-nuts";

export type ProductBadge = "bestseller" | "new" | "natural" | "limited";

/** Full offer with internal economics (admin + resolver) */
export interface ProductOffer {
  id: string;
  sku: string;
  label: string;
  weight: string;
  hint?: string;
  economics: PricingEconomics;
}

/** Public-safe offer — storefront only */
export interface PublicProductOffer {
  id: string;
  label: string;
  weight: string;
  hint?: string;
  price: number;
}

export interface ProductFaq {
  q: string;
  a: string;
}

export interface ProductReview {
  id: string;
  author: string;
  city: string;
  rating: number;
  date: string;
  content: string;
}

export interface Product {
  id: string;
  slug: string;
  nameAr: string;
  shortDescription: string;
  description: string;
  /** Lowest variant sale price — public */
  price: number;
  image: string;
  images: string[];
  category: Exclude<ProductCategory, "all">;
  badges: ProductBadge[];
  weight?: string;
  ingredients: string[];
  benefits: string[];
  usageSuggestions: string[];
  offers: ProductOffer[];
  faq: ProductFaq[];
  reviews: ProductReview[];
  rating: number;
  reviewCount: number;
  relatedSlugs: string[];
}

export type PublicProduct = Omit<Product, "offers" | "price"> & {
  price: number;
  offers: PublicProductOffer[];
};

export const CATEGORY_LABELS: Record<
  Exclude<ProductCategory, "all">,
  string
> = {
  bundles: "باقات عائلية",
  amlou: "أملو",
  honey: "عسل",
  oils: "زيوت طبيعية",
  "honey-nuts": "عسل ومكسرات",
};

export const BADGE_LABELS: Record<ProductBadge, string> = {
  bestseller: "الأكثر مبيعاً",
  new: "جديد",
  natural: "طبيعي 100%",
  limited: "عرض محدود",
};
