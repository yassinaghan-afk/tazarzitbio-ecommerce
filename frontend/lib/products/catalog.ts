import type { Product } from "./types";

const IMG = "/images/products";

export const products: Product[] = [
  {
    id: "premium-family-pack",
    slug: "premium-family-pack",
    nameAr: "باقة العائلة الفاخرة",
    shortDescription:
      "مجموعة تازارزيت بيو الكاملة — أملو، زيت أركان، ومكسرات بالعسل في تغليف هدايا فاخر.",
    description:
      "باقة العائلة الفاخرة تجمع أشهر منتجاتنا في عرض واحد مصمم للفطور المغربي والضيافة والإهداء. كل منتج يُحضّر يدوياً من مكونات طبيعية مختارة من سوس، بتغليف أنيق يليق بالمناسبات.",
    price: 399,
    oldPrice: 520,
    image: `${IMG}/pack.png`,
    images: [`${IMG}/pack.png`],
    category: "bundles",
    badges: ["gift", "bestseller", "natural"],
    weight: "مجموعة متنوعة",
    ingredients: [
      "أملو باللوز",
      "أملو بالفستق",
      "مكسرات بالعسل",
      "زيت أركان بكر",
    ],
    benefits: [
      "توفير ملموس مقارنة بالشراء المنفصل",
      "تغليف هدايا جاهز للمناسبات",
      "تجربة كاملة لذوق تازارزيت بيو",
      "مثالي للعائلة والضيافة",
    ],
    usageSuggestions: [
      "قدّمها في فطور الأحد أو العيد",
      "أهدِها لمن تحب في المناسبات",
      "وزّع المحتويات على مائدة الضيافة",
    ],
    offers: [
      {
        id: "pack-standard",
        label: "باقة العائلة الكاملة",
        price: 399,
        oldPrice: 520,
        hint: "4 منتجات فاخرة",
      },
      {
        id: "pack-duo-gift",
        label: "عرض هدية مزدوجة (باقتان)",
        price: 749,
        oldPrice: 980,
        hint: "للمناسبات الكبيرة",
      },
    ],
    faq: [
      {
        q: "ماذا تحتوي الباقة؟",
        a: "تشمل أملو اللوز، أملو الفستق، مكسرات بالعسل، وزيت أركان نقي — بتغليف فاخر.",
      },
      {
        q: "هل التغليف مناسب للإهداء؟",
        a: "نعم، صُممت خصيصاً للهدايا والمناسبات مع بطاقة هدايا أنيقة.",
      },
    ],
    reviews: [
      {
        id: "r1",
        author: "يوسف بنعلي",
        city: "الرباط",
        rating: 5,
        date: "أبريل 2026",
        content: "علبة رائعة للعيد — الجودة فاقت التوقعات والتوصيل سريع.",
      },
    ],
    rating: 4.9,
    reviewCount: 186,
    relatedSlugs: ["almond-amlou", "pistachio-amlou", "mixed-nuts-honey"],
  },
  {
    id: "almond-amlou",
    slug: "almond-amlou",
    nameAr: "أملو باللوز",
    shortDescription:
      "معجون لوز مطحون يدوياً مع عسل نقي وزيت أركان — طعم سوس الأصيل.",
    description:
      "أملو باللوز من تازارزيت بيو يُحضّر بطريقة تقليدية: لوز محلي مطحون ببطء، ممزوج بعسل طبيعي وزيت أركان بكر. قوام كريمي غني ونكهة دافئة تليق بفطور المغرب الأصيل.",
    price: 109,
    oldPrice: 135,
    image: `${IMG}/almond-amlou.png`,
    images: [`${IMG}/almond-amlou.png`],
    category: "amlou",
    badges: ["bestseller", "natural"],
    weight: "250 غ",
    ingredients: ["لوز محلي", "عسل طبيعي", "زيت أركان بكر"],
    benefits: [
      "مصدر طاقة طبيعي للفطور",
      "غني بالأوميغا والفيتامين E",
      "بدون مواد حافظة",
      "طعم أصيل من سوس",
    ],
    usageSuggestions: [
      "ادهنه على خبز البيت أو الملوي",
      "أضفه إلى الشوفان والزبادي",
      "قدّمه مع الشاي المغربي",
    ],
    offers: [
      {
        id: "almond-single",
        label: "عبوة واحدة — 250 غ",
        price: 109,
        oldPrice: 135,
      },
      {
        id: "almond-duo",
        label: "عرض زوجي — عبوتان",
        price: 199,
        oldPrice: 250,
        hint: "وفّر أكثر",
      },
    ],
    faq: [
      {
        q: "كم مدة الصلاحية؟",
        a: "6 أشهر من تاريخ التحضير عند التخزين في مكان بارد وجاف.",
      },
      {
        q: "هل يحتوي على سكر مضاف؟",
        a: "لا، حلاوته من العسل الطبيعي فقط.",
      },
    ],
    reviews: [
      {
        id: "r1",
        author: "فاطمة الزهراء",
        city: "الدار البيضاء",
        rating: 5,
        date: "مايو 2026",
        content: "أفضل أملو جربته — طعم طبيعي وتغليف أنيق.",
      },
    ],
    rating: 4.9,
    reviewCount: 312,
    relatedSlugs: ["pistachio-amlou", "premium-family-pack", "argan-oil"],
  },
  {
    id: "pistachio-amlou",
    slug: "pistachio-amlou",
    nameAr: "أملو بالفستق",
    shortDescription:
      "فستق أخضر فاخر مطحون مع عسل وزيت أركان — نكهة راقية ولون طبيعي.",
    description:
      "أملو بالفستق يجمع أفضل حبات الفستق المغربي مع عسل سوس وزيت أركان. تحضير حرفي بطيء يحافظ على اللون الأخضر الطبيعي والنكهة الغنية.",
    price: 129,
    oldPrice: 160,
    image: `${IMG}/pistachio-amlou.png`,
    images: [`${IMG}/pistachio-amlou.png`],
    category: "amlou",
    badges: ["new", "natural"],
    weight: "250 غ",
    ingredients: ["فستق طبيعي", "عسل طبيعي", "زيت أركان بكر"],
    benefits: [
      "نكهة فاخرة ومميزة",
      "مثالي للإهداء",
      "غني بالبروتين والألياف",
      "تحضير حرفي بطيء",
    ],
    usageSuggestions: [
      "على خبز محمص للفطور",
      "مع التمر في رمضان",
      "كحشوة لفطائر صغيرة فاخرة",
    ],
    offers: [
      {
        id: "pistachio-single",
        label: "عبوة واحدة — 250 غ",
        price: 129,
        oldPrice: 160,
      },
      {
        id: "pistachio-duo",
        label: "عرض زوجي — عبوتان",
        price: 239,
        oldPrice: 300,
      },
    ],
    faq: [
      {
        q: "هل اللون الأخضر طبيعي؟",
        a: "نعم، من الفستق الطبيعي دون صبغات.",
      },
    ],
    reviews: [
      {
        id: "r1",
        author: "نادية السوسي",
        city: "أكادير",
        rating: 5,
        date: "مارس 2026",
        content: "فستق طازج وطعم رائع — يستحق السعر.",
      },
    ],
    rating: 5,
    reviewCount: 198,
    relatedSlugs: ["almond-amlou", "premium-family-pack", "mixed-nuts-honey"],
  },
  {
    id: "argan-oil",
    slug: "argan-oil",
    nameAr: "زيت أركان مغربي نقي",
    shortDescription:
      "زيت أركان بكر معصور على البارد — للوجه والجسم والشعر.",
    description:
      "زيت أركان تازارزيت بيو يُستخرج من ثمار أشجار الأركان في سوس، معصوراً على البارد للحفاظ على الفيتامينات والأحماض الدهنية. نقي 100% دون خلط أو إضافات.",
    price: 149,
    oldPrice: 179,
    image: `${IMG}/argan-oil.png`,
    images: [`${IMG}/argan-oil.png`],
    category: "oils",
    badges: ["natural", "bestseller"],
    weight: "250 مل",
    ingredients: ["زيت أركان بكر 100%"],
    benefits: [
      "ترطيب عميق للبشرة",
      "تغذية الشعر وتقليل التقصف",
      "غني بفيتامين E",
      "معصور على البارد",
    ],
    usageSuggestions: [
      "قطرتان على الوجه ليلاً",
      "تدليك فروة الرأس أسبوعياً",
      "على الجسم بعد الاستحمام",
    ],
    offers: [
      {
        id: "argan-250",
        label: "زجاجة 250 مل",
        price: 149,
        oldPrice: 179,
      },
      {
        id: "argan-duo",
        label: "عرض زوجي — زجاجتان",
        price: 279,
        oldPrice: 340,
      },
    ],
    faq: [
      {
        q: "هل مناسب للبشرة الدهنية؟",
        a: "نعم بكميات صغيرة — يُمتص بسرعة دون ملمس دهني.",
      },
    ],
    reviews: [
      {
        id: "r1",
        author: "نادية السوسي",
        city: "أكادير",
        rating: 5,
        date: "مارس 2026",
        content: "زيت حقيقي من سوس — فرق واضح على بشرتي.",
      },
    ],
    rating: 4.8,
    reviewCount: 156,
    relatedSlugs: ["almond-amlou", "premium-family-pack"],
  },
  {
    id: "mixed-nuts-honey",
    slug: "mixed-nuts-honey",
    nameAr: "مكسرات بالعسل",
    shortDescription:
      "لوز وجوز وفستق مغطى بعسل طبيعي كثيف — قرمشة وعسل ذهبي.",
    description:
      "مزيج فاخر من المكسرات المختارة يدوياً، مغموس بعسل طبيعي من سوس. وجبة خفيفة فاخرة ولمسة ضيافة مثالية مع الشاي والقهوة.",
    price: 95,
    oldPrice: 115,
    image: `${IMG}/mixed-nuts.png`,
    images: [`${IMG}/mixed-nuts.png`],
    category: "honey-nuts",
    badges: ["natural", "bestseller"],
    weight: "250 غ",
    ingredients: ["لوز", "جوز", "فستق", "عسل طبيعي"],
    benefits: [
      "طاقة طبيعية سريعة",
      "مثالي للضيافة",
      "بدون سكر مضاف",
      "مكسرات مختارة يدوياً",
    ],
    usageSuggestions: [
      "مع الشاي المغربي",
      "وجبة خفيفة بين الوجبات",
      "في سلطات أو حلويات",
    ],
    offers: [
      {
        id: "nuts-single",
        label: "مرطبان 250 غ",
        price: 95,
        oldPrice: 115,
      },
      {
        id: "nuts-duo",
        label: "عرض زوجي — مرطبانان",
        price: 175,
        oldPrice: 210,
      },
    ],
    faq: [
      {
        q: "هل يحتوي على مواد حافظة؟",
        a: "لا، العسل الطبيعي يحافظ على النضارة.",
      },
    ],
    reviews: [
      {
        id: "r1",
        author: "كريم الحموي",
        city: "مراكش",
        rating: 5,
        date: "فبراير 2026",
        content: "عسل غني ومكسرات مقرمشة — ضيوفنا أحبوها.",
      },
    ],
    rating: 4.9,
    reviewCount: 241,
    relatedSlugs: ["premium-family-pack", "almond-amlou", "pistachio-amlou"],
  },
];

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getProductsByCategory(
  category: import("./types").ProductCategory,
): Product[] {
  if (category === "all") return products;
  return products.filter((p) => p.category === category);
}

export function getRelatedProducts(slugs: string[]): Product[] {
  return slugs
    .map((slug) => getProductBySlug(slug))
    .filter((p): p is Product => Boolean(p));
}
