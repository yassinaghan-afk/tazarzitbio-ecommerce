import type { PricingOverrides } from "./admin-storage";
import { buildPricingEconomics, type PricingInput } from "./pricing";
import type { Product, ProductOffer } from "./types";

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
      "family-pack",
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
        "طاقة طبيعية للفطور",
        "غني بالأوميغا وفيتامين E",
        "بدون مواد حافظة",
      ],
      usageSuggestions: [
        "على خبز البيت أو الملوي",
        "مع الشاي المغربي",
        "وجبة خفيفة للأطفال",
      ],
      offers: almondOffers,
      faq: [
        { q: "كم مدة الصلاحية؟", a: "6 أشهر في مكان بارد وجاف." },
        { q: "هل يوجد سكر مضاف؟", a: "لا، الحلاوة من العسل الطبيعي فقط." },
      ],
      reviews: [
        {
          id: "r1",
          author: "فاطمة الزهراء",
          city: "الدار البيضاء",
          rating: 5,
          date: "مايو 2026",
          content: "أفضل أملو جربته — طعم طبيعي وتغليف عملي.",
        },
      ],
      rating: 4.9,
      reviewCount: 312,
      relatedSlugs: ["pistachio-amlou", "mixed-nuts-honey", "family-value-pack"],
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
      benefits: ["نكهة مميزة", "غني بالبروتين", "تحضير حرفي بطيء"],
      usageSuggestions: ["فطور العائلة", "مع التمر", "للضيافة"],
      offers: pistachioOffers,
      faq: [
        { q: "هل اللون الأخضر طبيعي؟", a: "نعم، من الفستق دون صبغات." },
      ],
      reviews: [
        {
          id: "r1",
          author: "نادية السوسي",
          city: "أكادير",
          rating: 5,
          date: "مارس 2026",
          content: "فستق طازج وطعم رائع.",
        },
      ],
      rating: 5,
      reviewCount: 198,
      relatedSlugs: ["almond-amlou", "mixed-nuts-honey", "family-value-pack"],
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
      benefits: ["ترطيب البشرة", "تغذية الشعر", "فيتامين E"],
      usageSuggestions: ["ليلاً على الوجه", "تدليك الشعر", "بعد الاستحمام"],
      offers: arganOffers,
      faq: [
        { q: "هل مناسب للبشرة الدهنية؟", a: "نعم بكميات صغيرة." },
      ],
      reviews: [
        {
          id: "r1",
          author: "نادية السوسي",
          city: "أكادير",
          rating: 5,
          date: "مارس 2026",
          content: "زيت حقيقي من سوس.",
        },
      ],
      rating: 4.8,
      reviewCount: 156,
      relatedSlugs: ["almond-amlou", "family-value-pack"],
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
      benefits: ["طاقة سريعة", "بدون سكر مضاف", "للضيافة"],
      usageSuggestions: ["مع الشاي", "وجبة خفيفة", "في الحلويات"],
      offers: nutsOffers,
      faq: [
        { q: "مواد حافظة؟", a: "لا، العسل يحافظ على النضارة." },
      ],
      reviews: [
        {
          id: "r1",
          author: "كريم الحموي",
          city: "مراكش",
          rating: 5,
          date: "فبراير 2026",
          content: "عسل غني ومكسرات مقرمشة.",
        },
      ],
      rating: 4.9,
      reviewCount: 241,
      relatedSlugs: ["almond-amlou", "pistachio-amlou", "family-value-pack"],
    },
    {
      id: "family-value-pack",
      slug: "family-value-pack",
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
      reviews: [
        {
          id: "r1",
          author: "يوسف بنعلي",
          city: "الرباط",
          rating: 5,
          date: "أبريل 2026",
          content: "باقة عملية بسعر معقول — العائلة أحبتها.",
        },
      ],
      rating: 4.9,
      reviewCount: 124,
      relatedSlugs: ["almond-amlou", "pistachio-amlou", "mixed-nuts-honey"],
    },
  ];

  return catalog;
}

/** Default catalog (SSR / build) */
export const baseCatalog = buildCatalog();
