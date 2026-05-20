export type {
  AdminProductData,
  AdminVariantOverride,
  CmsCategory,
  CmsProductRecord,
  CmsProductSource,
  CmsProductVariant,
} from "./product-types";
export {
  CMS_BADGES,
  CMS_CATEGORIES,
  PRESET_VARIANTS,
  createEmptyProduct,
  createEmptyVariant,
  slugify,
} from "./product-types";

export {
  ANNOUNCEMENT_BAR_HEIGHT_PX,
  DEFAULT_ANNOUNCEMENT_BAR,
  getActiveAnnouncementMessages,
  normalizeAnnouncementBar,
} from "./announcement-bar";
export type {
  AnnouncementBarConfig,
  AnnouncementIcon,
  AnnouncementMessage,
} from "./announcement-bar";

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
