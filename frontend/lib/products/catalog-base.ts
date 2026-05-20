import type { PricingOverrides } from "./admin-storage";
import { buildPricingEconomics, type PricingInput } from "./pricing";
import {
  REVIEWS_ALMOND,
  REVIEWS_ARGAN,
  REVIEWS_FAMILY,
  REVIEWS_NUTS,
  REVIEWS_PISTACHIO,
} from "./reviews-darija";
import type { Product, ProductOffer } from "./types";
import { expandCatalogWithVariants } from "./variant-products";

const IMG = "/images/products";

function offer(
  id: string,
  sku: string,
  label: string,
  weight: string,
  input: PricingInput,
  hint?: string,
  overrides?: PricingOverrides,
): ProductOffer {
  const o = overrides?.[id];
  const economics = buildPricingEconomics({
    costPrice: o?.costPrice ?? input.costPrice,
    salePrice: o?.salePrice ?? input.salePrice,
    estimatedDeliveryCost: o?.estimatedDeliveryCost ?? input.estimatedDeliveryCost,
    estimatedAdsCost: o?.estimatedAdsCost ?? input.estimatedAdsCost,
  });
  return { id, sku, label, weight, hint, economics };
}

function lowestPrice(offers: ProductOffer[]): number {
  return Math.min(...offers.map((o) => o.economics.salePrice));
}

export function buildCatalog(overrides?: PricingOverrides): Product[] {
  const almondOffers = [
    offer("almond-250", "AML-ALM-250", "250 غ", "250 غ", { costPrice: 64.5, salePrice: 119 }, undefined, overrides),
    offer("almond-500", "AML-ALM-500", "500 غ", "500 غ", { costPrice: 107, salePrice: 199 }, "الأكثر طلباً", overrides),
    offer("almond-750", "AML-ALM-750", "750 غ", "750 غ", { costPrice: 149.5, salePrice: 279 }, "قيمة عائلية", overrides),
  ];

  const pistachioOffers = [
    offer("pistachio-250", "AML-PIS-250", "250 غ", "250 غ", { costPrice: 102, salePrice: 199 }, undefined, overrides),
    offer("pistachio-500", "AML-PIS-500", "500 غ", "500 غ", { costPrice: 182, salePrice: 329 }, undefined, overrides),
    offer("pistachio-750", "AML-PIS-750", "750 غ", "750 غ", { costPrice: 262, salePrice: 449 }, undefined, overrides),
  ];

  const arganOffers = [
    offer("argan-250", "OIL-ARG-250", "250 مل", "250 مل", { costPrice: 172, salePrice: 299 }, undefined, overrides),
    offer("argan-500", "OIL-ARG-500", "500 مل", "500 مل", { costPrice: 322, salePrice: 549 }, undefined, overrides),
  ];

  const nutsOffers = [
    offer("nuts-250", "NUT-HON-250", "250 غ", "250 غ", { costPrice: 62, salePrice: 129 }, undefined, overrides),
  ];

  const familyOffers = [
    offer(
      "premium-family-pack",
      "BND-FAM-01",
      "باقة عائلية — تشكيلة 250غ",
      "4 منتجات",
      { costPrice: 400.5, salePrice: 499 },
      "أملو لوز + فستق + مكسرات + أركان",
      overrides,
    ),
  ];

  const catalog: Product[] = [
    {
      id: "almond-amlou",
      slug: "almond-amlou",
      nameAr: "أملو باللوز",
      shortDescription:
        "معجون لوز مطحون يدوياً مع عسل نقي وزيت أركان — طعم سوس الأصيل.",
      description:
        "أملو باللوز من تازارزيت بيو يُحضّر بطريقة تقليدية من لوز محلي وعسل طبيعي وزيت أركان بكر. متوفر بعدة أحجام لتناسب الفرد والعائلة.",
      price: lowestPrice(almondOffers),
      image: `${IMG}/almond-amlou.png`,
      images: [`${IMG}/almond-amlou.png`],
      category: "amlou",
      badges: ["bestseller", "natural"],
      weight: "250 غ — 750 غ",
      ingredients: ["لوز محلي", "عسل طبيعي", "زيت أركان بكر"],
      benefits: [
        "طعم لوز غني وقومة كريمة",
        "مثالي لفطور العائلة",
        "بدون مواد حافظة أو إضافات",
      ],
      usageSuggestions: [
        "على خبز البيت أو الملوي",
        "مع الشاي المغربي والضيافة",
        "وجبة خفيفة على مائدة العائلة",
      ],
      offers: almondOffers,
      faq: [
        { q: "كم مدة الصلاحية؟", a: "6 أشهر في مكان بارد وجاف." },
        { q: "هل يوجد سكر مضاف؟", a: "لا، الحلاوة من العسل الطبيعي فقط." },
        {
          q: "كيف يتم الدفع والتوصيل؟",
          a: "الدفع عند الاستلام لجميع المدن. نتصل بك لتأكيد العنوان قبل الشحن.",
        },
        {
          q: "ما الأحجام المتوفرة؟",
          a: "250 غ، 500 غ، و750 غ — اختر الحجم المناسب لعائلتك.",
        },
      ],
      reviews: REVIEWS_ALMOND,
      rating: 4.9,
      reviewCount: 312,
      relatedSlugs: ["pistachio-amlou", "mixed-nuts-honey", "premium-family-pack"],
    },
    {
      id: "pistachio-amlou",
      slug: "pistachio-amlou",
      nameAr: "أملو بالفستق",
      shortDescription:
        "فستق أخضر فاخر مع عسل وزيت أركان — نكهة راقية ولون طبيعي.",
      description:
        "أملو بالفستق يجمع حبات الفستق المغربي مع عسل سوس وزيت أركان. تحضير حرفي يحافظ على النكهة واللون الطبيعي.",
      price: lowestPrice(pistachioOffers),
      image: `${IMG}/pistachio-amlou.png`,
      images: [`${IMG}/pistachio-amlou.png`],
      category: "amlou",
      badges: ["new", "natural"],
      weight: "250 غ — 750 غ",
      ingredients: ["فستق طبيعي", "عسل طبيعي", "زيت أركان بكر"],
      benefits: [
        "نكهة فستق أصيلة ولون طبيعي",
        "تحضير حرفي بطيء",
        "مناسب للضيافة والهدايا العائلية",
      ],
      usageSuggestions: [
        "فطور الأحد مع العائلة",
        "مع التمر والشاي",
        "لضيافة الضيوف المغربية",
      ],
      offers: pistachioOffers,
      faq: [
        { q: "هل اللون الأخضر طبيعي؟", a: "نعم، من الفستق دون صبغات." },
        {
          q: "الدفع عند الاستلام؟",
          a: "نعم، تدفع نقداً عند استلام الطلب فقط.",
        },
        {
          q: "كيف نخزّنه؟",
          a: "في مكان بارد وجاف، بعيداً عن الشمس المباشرة.",
        },
      ],
      reviews: REVIEWS_PISTACHIO,
      rating: 5,
      reviewCount: 198,
      relatedSlugs: ["almond-amlou", "mixed-nuts-honey", "premium-family-pack"],
    },
    {
      id: "argan-oil",
      slug: "argan-oil",
      nameAr: "زيت أركان مغربي",
      shortDescription:
        "زيت أركان بكر معصور على البارد — للوجه والجسم والشعر.",
      description:
        "زيت أركان نقي 100% من ثمار أشجار الأركان في سوس. معصور على البارد للحفاظ على الفيتامينات.",
      price: lowestPrice(arganOffers),
      image: `${IMG}/argan-oil.png`,
      images: [`${IMG}/argan-oil.png`],
      category: "oils",
      badges: ["natural", "bestseller"],
      weight: "250 مل — 500 مل",
      ingredients: ["زيت أركان بكر 100%"],
      benefits: [
        "زيت بكر معصور على البارد",
        "ريحة نقية من سوس",
        "للعناية اليومية بالوجه والشعر",
      ],
      usageSuggestions: [
        "ليلاً على الوجه واليدين",
        "تدليك أطراف الشعر",
        "هدية عملية من المغرب",
      ],
      offers: arganOffers,
      faq: [
        {
          q: "هل الزيت للأكل أو للعناية؟",
          a: "هذا الزيت مخصص للعناية بالبشرة والشعر.",
        },
        {
          q: "ما مدة التوصيل؟",
          a: "1–5 أيام عمل حسب المدينة، مع اتصال تأكيد قبل الشحن.",
        },
      ],
      reviews: REVIEWS_ARGAN,
      rating: 4.8,
      reviewCount: 156,
      relatedSlugs: ["almond-amlou", "premium-family-pack"],
    },
    {
      id: "mixed-nuts-honey",
      slug: "mixed-nuts-honey",
      nameAr: "مكسرات بالعسل",
      shortDescription:
        "لوز وجوز وفستق بعسل طبيعي كثيف — قرمشة وعسل ذهبي.",
      description:
        "مزيج مكسرات مختار يدوياً مع عسل طبيعي من سوس. مثالي للضيافة والوجبات الخفيفة.",
      price: lowestPrice(nutsOffers),
      image: `${IMG}/mixed-nuts.png`,
      images: [`${IMG}/mixed-nuts.png`],
      category: "honey-nuts",
      badges: ["natural", "bestseller"],
      weight: "250 غ",
      ingredients: ["لوز", "جوز", "فستق", "عسل طبيعي"],
      benefits: [
        "قرمشة مكسرات مع عسل كثيف",
        "بدون سكر مضاف",
        "مثالي للضيافة والعائلة",
      ],
      usageSuggestions: [
        "مع أتاي المغربي",
        "وجبة خفيفة بين الوجبات",
        "على مائدة الضيافة",
      ],
      offers: nutsOffers,
      faq: [
        { q: "مواد حافظة؟", a: "لا، العسل يحافظ على النضارة." },
        {
          q: "هل التوصيل لكل المدن؟",
          a: "نعم، لجميع مدن المغرب مع الدفع عند الاستلام.",
        },
      ],
      reviews: REVIEWS_NUTS,
      rating: 4.9,
      reviewCount: 241,
      relatedSlugs: ["almond-amlou", "pistachio-amlou", "premium-family-pack"],
    },
    {
      id: "premium-family-pack",
      slug: "premium-family-pack",
      nameAr: "باقة العائلة — قيمة ممتازة",
      shortDescription:
        "تشكيلة عائلية: أملو لوز وفستق، مكسرات بالعسل، وزيت أركان — بسعر أوفر من الشراء المنفصل.",
      description:
        "باقة العائلة تجمع منتجاتنا الأساسية بحجم 250غ/250مل لتجربة كاملة بسعر مناسب. مثالية للفطور اليومي والمخزون العائلي — دون تغليف هدايا فاخر.",
      price: lowestPrice(familyOffers),
      image: `${IMG}/pack.png`,
      images: [`${IMG}/pack.png`],
      category: "bundles",
      badges: ["bestseller", "limited"],
      weight: "4 منتجات",
      ingredients: [
        "أملو لوز 250غ",
        "أملو فستق 250غ",
        "مكسرات بالعسل 250غ",
        "زيت أركان 250مل",
      ],
      benefits: [
        "توفير مقارنة بالشراء المنفصل",
        "تشكيلة متكاملة للعائلة",
        "أسعار مناسبة",
      ],
      usageSuggestions: [
        "فطور الأسبوع للعائلة",
        "تجربة العلامة لأول مرة",
        "مخزون شهري",
      ],
      offers: familyOffers,
      faq: [
        {
          q: "ماذا تحتوي الباقة؟",
          a: "أملو لوز 250غ، أملو فستق 250غ، مكسرات بالعسل 250غ، زيت أركان 250مل.",
        },
        {
          q: "هل هذا تغليف هدايا؟",
          a: "لا، باقة قيمة عائلية بتغليف عملي وليس علبة هدايا فاخرة.",
        },
      ],
      reviews: REVIEWS_FAMILY,
      rating: 4.9,
      reviewCount: 124,
      relatedSlugs: ["almond-amlou", "pistachio-amlou", "mixed-nuts-honey"],
    },
  ];

  return expandCatalogWithVariants(catalog);
}

/** Default catalog (SSR / build) */
export const baseCatalog = buildCatalog();
