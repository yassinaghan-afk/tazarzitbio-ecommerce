import type { ProductBadge, ProductCategory } from "@/lib/products/types";

export type CmsProductSource = "catalog" | "custom";

export type CmsCategory = Exclude<ProductCategory, "all">;

export interface CmsProductVariant {
  id: string;
  label: string;
  weight: string;
  sku: string;
  salePrice: number;
  costPrice: number;
  stock: number;
  hint?: string;
}

export interface CmsProductRecord {
  id: string;
  source: CmsProductSource;
  slug: string;
  nameAr: string;
  nameFr?: string;
  category: CmsCategory;
  shortDescription: string;
  description: string;
  ingredients: string[];
  benefits: string[];
  usageSuggestions: string[];
  images: string[];
  badges: ProductBadge[];
  offers: CmsProductVariant[];
  isVisible: boolean;
  isBundle: boolean;
  isFeatured: boolean;
  isBestseller: boolean;
  seoTitle?: string;
  seoDescription?: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export const CMS_CATEGORIES: { id: CmsCategory; label: string }[] = [
  { id: "amlou", label: "Amlou" },
  { id: "honey", label: "Honey" },
  { id: "oils", label: "Oils" },
  { id: "honey-nuts", label: "Honey & Nuts" },
  { id: "bundles", label: "Bundles & Packs" },
];

export const CMS_BADGES: { id: ProductBadge; label: string }[] = [
  { id: "bestseller", label: "Bestseller" },
  { id: "new", label: "New" },
  { id: "natural", label: "Natural" },
  { id: "limited", label: "Limited" },
];

export const PRESET_VARIANTS = [
  { label: "250g", weight: "250 غ" },
  { label: "500g", weight: "500 غ" },
  { label: "750g", weight: "750 غ" },
] as const;

export function createEmptyVariant(
  productId: string,
  label: string,
  weight: string,
  index: number,
): CmsProductVariant {
  const slug = label.toLowerCase().replace(/\s+/g, "-");
  return {
    id: `${productId}-${slug}-${index}`,
    label,
    weight,
    sku: "",
    salePrice: 0,
    costPrice: 0,
    stock: 0,
  };
}

export function createEmptyProduct(): CmsProductRecord {
  const id = `custom-${crypto.randomUUID().slice(0, 8)}`;
  const now = new Date().toISOString();
  return {
    id,
    source: "custom",
    slug: "",
    nameAr: "",
    nameFr: "",
    category: "amlou",
    shortDescription: "",
    description: "",
    ingredients: [],
    benefits: [],
    usageSuggestions: [],
    images: [],
    badges: [],
    offers: [
      createEmptyVariant(id, "250g", "250 غ", 0),
      createEmptyVariant(id, "500g", "500 غ", 1),
      createEmptyVariant(id, "750g", "750 غ", 2),
    ],
    isVisible: true,
    isBundle: false,
    isFeatured: false,
    isBestseller: false,
    seoTitle: "",
    seoDescription: "",
    sortOrder: 999,
    createdAt: now,
    updatedAt: now,
  };
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/** @deprecated use CmsProductRecord — kept for store migration */
export interface AdminVariantOverride {
  id: string;
  label?: string;
  salePrice?: number;
  costPrice?: number;
  stock?: number;
}

/** @deprecated use CmsProductRecord */
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
