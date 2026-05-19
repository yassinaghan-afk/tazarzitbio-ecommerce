export type ProductCategory =
  | "all"
  | "bundles"
  | "amlou"
  | "oils"
  | "honey-nuts";

export type ProductBadge =
  | "bestseller"
  | "new"
  | "natural"
  | "gift"
  | "limited";

export interface ProductOffer {
  id: string;
  label: string;
  price: number;
  oldPrice?: number;
  hint?: string;
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
  price: number;
  oldPrice?: number;
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

export const CATEGORY_LABELS: Record<
  Exclude<ProductCategory, "all">,
  string
> = {
  bundles: "باقات وعروض",
  amlou: "أملو",
  oils: "زيوت طبيعية",
  "honey-nuts": "عسل ومكسرات",
};

export const BADGE_LABELS: Record<ProductBadge, string> = {
  bestseller: "الأكثر مبيعاً",
  new: "جديد",
  natural: "طبيعي 100%",
  gift: "هدية فاخرة",
  limited: "عرض محدود",
};
