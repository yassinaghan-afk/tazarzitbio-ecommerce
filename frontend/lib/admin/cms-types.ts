/**
 * CMS entity types persisted in the server store (data/store.json).
 * These power the Admin Dashboard and are read by the public website.
 */

/* ------------------------------- Categories ------------------------------ */

export interface CategoryRecord {
  id: string;
  slug: string;
  nameAr: string;
  nameFr: string;
  description: string;
  image: string;
  sortOrder: number;
  isFeatured: boolean;
  isVisible: boolean;
  seoTitle?: string;
  seoDescription?: string;
  createdAt: string;
  updatedAt: string;
}

/* -------------------------------- Reviews -------------------------------- */

export interface ReviewRecord {
  id: string;
  /** empty = site-wide testimonial (homepage) */
  productSlug: string;
  author: string;
  city: string;
  rating: number; // 1..5
  text: string;
  date: string; // display date
  photo?: string;
  isApproved: boolean;
  isFeatured: boolean;
  createdAt: string;
}

/* ---------------------------------- FAQs ---------------------------------- */

export interface FaqRecord {
  id: string;
  questionAr: string;
  answerAr: string;
  questionFr: string;
  answerFr: string;
  /** empty = global FAQ (homepage) */
  productSlug: string;
  sortOrder: number;
  isActive: boolean;
}

/* ------------------------------- Navigation ------------------------------- */

export interface NavLinkRecord {
  id: string;
  labelAr: string;
  labelFr: string;
  labelEn: string;
  href: string;
  isVisible: boolean;
  sortOrder: number;
}

export interface NavigationSettings {
  /** empty array = use built-in default menu */
  header: NavLinkRecord[];
  footerShop: NavLinkRecord[];
  footerInfo: NavLinkRecord[];
}

export const DEFAULT_NAVIGATION: NavigationSettings = {
  header: [],
  footerShop: [],
  footerInfo: [],
};

/* ------------------------------ Site settings ----------------------------- */

export interface SiteSettings {
  brandName: string;
  logoUrl: string;
  faviconUrl: string;
  phone: string;
  whatsapp: string;
  email: string;
  instagram: string;
  tiktok: string;
  facebook: string;
  address: string;
  currency: string;
  country: string;
  seoTitle: string;
  seoDescription: string;
  ogImage: string;
  supportHours: string;
}

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  brandName: "Tazarzit Bio",
  logoUrl: "",
  faviconUrl: "",
  phone: "+212 600 000 000",
  whatsapp: "212600000000",
  email: "",
  instagram: "",
  tiktok: "",
  facebook: "",
  address: "",
  currency: "MAD",
  country: "Morocco",
  seoTitle: "",
  seoDescription: "",
  ogImage: "",
  supportHours: "",
};

/* ------------------------------- Promotions ------------------------------- */

export type PromotionType = "percentage" | "fixed" | "free-shipping";

export interface Promotion {
  id: string;
  code: string;
  type: PromotionType;
  /** percent (0–100) for percentage, MAD for fixed, unused for free-shipping */
  value: number;
  minSubtotal: number;
  startsAt: string; // ISO or ""
  endsAt: string; // ISO or ""
  usageLimit: number; // 0 = unlimited
  usedCount: number;
  isActive: boolean;
  createdAt: string;
}

export interface CouponValidationResult {
  valid: boolean;
  reason?: string;
  code?: string;
  discount?: number;
  freeShipping?: boolean;
}

/* -------------------------------- Audit log ------------------------------- */

export interface AuditLogEntry {
  id: string;
  action: string;
  objectType: string;
  objectId?: string;
  at: string; // ISO
}

/* ---------------------------- Homepage sections --------------------------- */

export type HomeSectionId =
  | "hero"
  | "trust-badges"
  | "family-pack"
  | "story"
  | "showcases"
  | "best-sellers"
  | "reviews"
  | "ingredients"
  | "lifestyle"
  | "faq"
  | "cta";

export interface HomeSectionConfig {
  id: HomeSectionId;
  isVisible: boolean;
}

export const HOME_SECTION_LABELS: Record<HomeSectionId, string> = {
  hero: "Hero",
  "trust-badges": "Trust Badges",
  "family-pack": "Family Pack",
  story: "Brand Story",
  showcases: "Product Showcases",
  "best-sellers": "Best Sellers",
  reviews: "Customer Reviews",
  ingredients: "Ingredients",
  lifestyle: "Lifestyle",
  faq: "FAQ",
  cta: "Final CTA",
};

export const DEFAULT_HOME_SECTIONS: HomeSectionConfig[] = [
  { id: "hero", isVisible: true },
  { id: "trust-badges", isVisible: true },
  { id: "family-pack", isVisible: true },
  { id: "story", isVisible: true },
  { id: "showcases", isVisible: true },
  { id: "best-sellers", isVisible: true },
  { id: "reviews", isVisible: true },
  { id: "ingredients", isVisible: true },
  { id: "lifestyle", isVisible: true },
  { id: "faq", isVisible: true },
  { id: "cta", isVisible: true },
];

/* ------------------------------ Media library ----------------------------- */

export interface MediaAssetMeta {
  url: string;
  alt: string;
}

export interface MediaAsset extends MediaAssetMeta {
  name: string;
  size: number;
  modifiedAt: string;
  kind: "image" | "video";
}

/* ----------------------------- Landing page v2 ---------------------------- */

export type LpBlockType =
  | "hero"
  | "heading"
  | "text"
  | "image"
  | "gallery"
  | "video"
  | "cta"
  | "benefits"
  | "testimonial"
  | "faq"
  | "offer"
  | "countdown"
  | "whatsapp"
  | "guarantee"
  | "divider";

export interface LpBlock {
  id: string;
  type: LpBlockType;
  isVisible: boolean;
  title: string;
  subtitle: string;
  text: string;
  imageUrl: string;
  /** extra images for gallery blocks */
  images: string[];
  videoUrl: string;
  ctaText: string;
  ctaHref: string;
  /** items for benefits / faq / testimonial lists — "title|body" per line */
  items: { title: string; body: string }[];
  /** ISO datetime for countdown blocks */
  countdownTo: string;
  background: "default" | "alt" | "dark" | "gold";
}

export function createLpBlock(type: LpBlockType): LpBlock {
  return {
    id: `blk-${crypto.randomUUID().slice(0, 8)}`,
    type,
    isVisible: true,
    title: "",
    subtitle: "",
    text: "",
    imageUrl: "",
    images: [],
    videoUrl: "",
    ctaText: "",
    ctaHref: "",
    items: [],
    countdownTo: "",
    background: "default",
  };
}

export const LP_BLOCK_LABELS: Record<LpBlockType, string> = {
  hero: "Hero",
  heading: "Heading",
  text: "Rich Text",
  image: "Image",
  gallery: "Image Gallery",
  video: "Video",
  cta: "Call To Action",
  benefits: "Benefits List",
  testimonial: "Testimonials",
  faq: "FAQ",
  offer: "Product Offer",
  countdown: "Countdown Timer",
  whatsapp: "WhatsApp CTA",
  guarantee: "Guarantee",
  divider: "Divider / Spacer",
};
