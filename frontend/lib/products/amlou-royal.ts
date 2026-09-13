import { DEFAULT_SHIPPING_SETTINGS } from "@/lib/shipping/settings";

export const AMLOU_ROYAL_ID = "amlou-royal";
export const AMLOU_ROYAL_SLUG = "amlou-royal";
export const AMLOU_ROYAL_NAME_AR = "أملو ملكي";
export const AMLOU_ROYAL_NAME_EN = "AMLOU ROYAL";
export const AMLOU_ROYAL_CANONICAL = "https://www.tazarzitbio.com/royal";
export const AMLOU_ROYAL_PATH = "/royal";

/** Bottle size for all Amlou Royal offers */
export const AMLOU_ROYAL_BOTTLE_WEIGHT_G = 500;

export const AMLOU_ROYAL_IMAGE = "/images/products/amlou-royal-hero.jpg";
export const AMLOU_ROYAL_TRUST_IMAGE = "/images/products/amlou-royal-trust.jpg";
export const AMLOU_ROYAL_INGREDIENTS_IMAGE =
  "/images/products/amlou-royal-ingredients.jpg";
export const AMLOU_ROYAL_BENEFITS_IMAGE =
  "/images/products/amlou-royal-benefits.jpg";

/** Ordered creative panels for /royal landing (1 = hero). Artboard 10 excluded. */
export const AMLOU_ROYAL_LP_IMAGES = [
  {
    src: "/images/royal/01-hero.jpg",
    alt: "استمتع بالطاقة الحقيقية مع أملو ملكي اللذيذ والصحي",
    width: 637,
    height: 1024,
  },
  {
    src: "/images/royal/02-problem.webp",
    alt: "هل تعاني دائماً من التعب والإرهاق؟",
    width: 800,
    height: 1698,
  },
  {
    src: "/images/royal/03-solution.webp",
    alt: "أملو ملكي هو الحل الطبيعي والأمثل — مكونات طبيعية فاخرة",
    width: 800,
    height: 2009,
  },
  {
    src: "/images/royal/04-benefits.webp",
    alt: "فوائد ومميزات أملو ملكي: طاقة، تركيز، بدون سكر، تغذية متكاملة",
    width: 800,
    height: 1732,
  },
  {
    src: "/images/royal/05-family.webp",
    alt: "استثمر في صحتك مع أملو ملكي",
    width: 800,
    height: 1191,
  },
  {
    src: "/images/royal/06-compare.webp",
    alt: "لماذا أملو ملكي أفضل من المنتجات المنافسة",
    width: 800,
    height: 1318,
  },
  {
    src: "/images/royal/07-testimonials.webp",
    alt: "شهادات زبناء أملو ملكي عبر واتساب",
    width: 800,
    height: 1577,
  },
  {
    src: "/images/royal/08-cta-lifestyle.webp",
    alt: "لا تفوت فرصة تحسين صحتك — توصيل مجاني والدفع عند الاستلام",
    width: 800,
    height: 1670,
  },
  {
    src: "/images/royal/09-guarantees.webp",
    alt: "ضمانات شركتنا: خدمة بعد البيع، توصيل سريع، الدفع عند الاستلام",
    width: 800,
    height: 1242,
  },
] as const;

export const AMLOU_ROYAL_IMAGES = [
  "/images/products/amlou-royal-hero.jpg",
  "/images/products/mixed-nuts.png",
  "/images/products/almond-amlou.png",
] as const;

export type AmlouRoyalVersionId = "honey" | "no-honey";

export const AMLOU_ROYAL_VERSIONS: {
  id: AmlouRoyalVersionId;
  labelAr: string;
  orderLabelAr: string;
  descriptionAr: string;
}[] = [
  {
    id: "honey",
    labelAr: "أملو بالعسل",
    orderLabelAr: "بالعسل",
    descriptionAr: "محلى بالعسل الطبيعي",
  },
  {
    id: "no-honey",
    labelAr: "أملو بدون عسل",
    orderLabelAr: "بدون عسل",
    descriptionAr: "بدون عسل — بدون سكر مضاف",
  },
];

export interface AmlouRoyalOffer {
  id: "royal-1" | "royal-2" | "royal-3";
  sku: string;
  bottles: 1 | 2 | 3;
  titleAr: string;
  weightAr: string;
  subtitleAr: string;
  price: number;
  originalPrice?: number;
  shippingFee: number;
  freeShipping: boolean;
  recommended?: boolean;
  bestValue?: boolean;
  giftAr?: string;
}

export const AMLOU_ROYAL_OFFERS: AmlouRoyalOffer[] = [
  {
    id: "royal-1",
    sku: "AML-ROY-1",
    bottles: 1,
    titleAr: "قنينة واحدة",
    weightAr: "500 غ",
    subtitleAr: "عناية وتجربة أولى",
    price: 249,
    shippingFee: 0,
    freeShipping: true,
  },
  {
    id: "royal-2",
    sku: "AML-ROY-2",
    bottles: 2,
    titleAr: "قنينتين",
    weightAr: "1 كغ",
    subtitleAr: "اختيار الأكثر طلباً",
    price: 399,
    originalPrice: 498,
    shippingFee: 0,
    freeShipping: true,
    recommended: true,
  },
  {
    id: "royal-3",
    sku: "AML-ROY-3",
    bottles: 3,
    titleAr: "3 قنينات",
    weightAr: "1.5 كغ",
    subtitleAr: "أفضل قيمة",
    price: 530,
    originalPrice: 747,
    shippingFee: 0,
    freeShipping: true,
    bestValue: true,
    giftAr: "🎁 + هدية",
  },
];

export const AMLOU_ROYAL_DEFAULT_OFFER_ID = "royal-2" as const;

export const AMLOU_ROYAL_INGREDIENTS = [
  "اللوز المحمص",
  "الفستق",
  "البندق المحمص",
  "الكاجو",
  "الكركاع",
  "جوز البرازيل",
  "بذور اليقطين المحمصة",
  "غذاء ملكات النحل",
  "زيت أركان غذائي",
  "عسل طبيعي",
] as const;

export function getAmlouRoyalOffer(
  offerId: string,
): AmlouRoyalOffer | undefined {
  return AMLOU_ROYAL_OFFERS.find((o) => o.id === offerId);
}

export function getAmlouRoyalVersion(
  versionId: string,
): (typeof AMLOU_ROYAL_VERSIONS)[number] | undefined {
  return AMLOU_ROYAL_VERSIONS.find((v) => v.id === versionId);
}

export function getAmlouRoyalShippingFee(
  offerId: string,
  defaultShippingPrice = DEFAULT_SHIPPING_SETTINGS.defaultShippingPrice,
): number {
  const offer = getAmlouRoyalOffer(offerId);
  if (!offer) return defaultShippingPrice;
  return offer.freeShipping ? 0 : defaultShippingPrice;
}

export function isAmlouRoyalLine(item: {
  slug?: string;
  productId?: string;
}): boolean {
  return (
    item.slug === AMLOU_ROYAL_SLUG || item.productId === AMLOU_ROYAL_ID
  );
}

export function resolveAmlouRoyalShippingFromLines(
  products: { slug?: string; productId?: string; offerId: string }[],
  defaultShippingPrice = DEFAULT_SHIPPING_SETTINGS.defaultShippingPrice,
): number | null {
  const royal = products.filter(isAmlouRoyalLine);
  if (royal.length === 0 || royal.length !== products.length) return null;
  const fees = royal.map((p) =>
    getAmlouRoyalShippingFee(p.offerId, defaultShippingPrice),
  );
  return Math.max(...fees);
}
