export interface AdminVariantOverride {
  id: string;
  label?: string;
  salePrice?: number;
  costPrice?: number;
  stock?: number;
}

export interface AdminProductData {
  id: string;
  nameAr?: string;
  slug?: string;
  shortDescription?: string;
  description?: string;
  images?: string[];
  isVisible?: boolean;
  isBundle?: boolean;
  badges?: string[];
  ingredients?: string[];
  benefits?: string[];
  variantOverrides?: AdminVariantOverride[];
}

export type BannerPlacement =
  | "top-bar"
  | "homepage-hero"
  | "product-page"
  | "checkout";

export interface Banner {
  id: string;
  text: string;
  imageUrl?: string;
  placement: BannerPlacement;
  isEnabled: boolean;
  createdAt: string;
}

export interface LandingPageSection {
  type: "hero" | "features" | "reviews" | "faq" | "cta";
  title?: string;
  content?: string;
}

export interface LandingPage {
  id: string;
  slug: string;
  featuredProductSlug: string;
  headline: string;
  subheadline: string;
  ctaText: string;
  sections: LandingPageSection[];
  isEnabled: boolean;
  createdAt: string;
}

export interface HomepageTrustBadge {
  icon: string;
  text: string;
}

export interface HomepageContent {
  heroHeadline: string;
  heroSubtitle: string;
  heroCta: string;
  heroBannerUrl: string;
  trustBadges: HomepageTrustBadge[];
  bestSellersTitle: string;
  familyPackTitle: string;
  reviewsTitle: string;
  faqTitle: string;
  finalCtaTitle: string;
  finalCtaText: string;
  finalCtaButton: string;
}

export const DEFAULT_HOMEPAGE_CONTENT: HomepageContent = {
  heroHeadline: "طعم المغرب الأصيل",
  heroSubtitle: "أملو، زيت أركان، ومكسرات طبيعية من قلب سوس",
  heroCta: "اطلب الآن",
  heroBannerUrl: "",
  trustBadges: [
    { icon: "truck", text: "توصيل لجميع المدن" },
    { icon: "shield", text: "الدفع عند الاستلام" },
    { icon: "leaf", text: "منتجات طبيعية 100%" },
    { icon: "phone", text: "فريقنا يتصل بك لتأكيد الطلب" },
  ],
  bestSellersTitle: "الأكثر مبيعاً",
  familyPackTitle: "الباقة العائلية",
  reviewsTitle: "آراء عملائنا",
  faqTitle: "أسئلة شائعة",
  finalCtaTitle: "اطلب الآن وادفع عند الاستلام",
  finalCtaText: "توصيل سريع لجميع مدن المغرب",
  finalCtaButton: "تسوق الآن",
};
