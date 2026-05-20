/** Homepage content — swap with CMS/API later */

import { HOMEPAGE_REVIEWS_DARIJA } from "@/lib/products/reviews-darija";

const IMG = "/images/products";

export const productShowcases = [
  {
    id: "daghmous-honey",
    label: "عسل الدغموس",
    title: "عسل الدغموس — ذهب سوس في كل ملعقة",
    description:
      "عسل الدغموس الطبيعي من مراعي سوس — قوام كثيف ولون ذهبي أصيل، مثالي للفطور والضيافة المغربية.",
    bullets: [
      "عسل نقي 100% من سوس",
      "نكهة غنية ولون ذهبي",
      "مثالي مع الملوي والشاي",
    ],
    price: 89,
    weight: "من 250 غ",
    imageSrc: `${IMG}/Daghmous_honey.jpeg`,
    imageAlt: "عسل الدغموس تازارزيت بيو",
    imageFirst: false,
    badge: "الأكثر طلباً",
  },
  {
    id: "thym-honey",
    label: "عسل الزعتر",
    title: "عسل الزعتر — رائحة جبلية أصيلة",
    description:
      "عسل الزعتر من جبال سوس — نكهة عطرية وطعم تقليدي يُجمع من نبات الزعتر البري ويُعبأ بعناية.",
    bullets: [
      "عسل من مراعي جبلية",
      "نكهة زعتر مميزة",
      "تغليف فاخر للإهداء",
    ],
    price: 89,
    weight: "من 250 غ",
    imageSrc: `${IMG}/saatar_honey.jpeg`,
    imageAlt: "عسل الزعتر تازارزيت بيو",
    imageFirst: true,
    badge: "جديد",
  },
  {
    id: "eucalyptus-honey",
    label: "عسل الأوكالبتوس",
    title: "عسل الأوكالبتوس — خفيف وطبيعي",
    description:
      "عسل الأوكالبتوس من خيرات سوس — قوام خفيف ونكهة مميزة، مثالي مع اللبن والمخبوزات.",
    bullets: [
      "عسل طبيعي من سوس",
      "قوام خفيف ولون شفاف",
      "أسعار مناسبة للعائلة",
    ],
    price: 89,
    weight: "من 250 غ",
    imageSrc: `${IMG}/eucalyptus_honey.jpeg`,
    imageAlt: "عسل الأوكالبتوس تازارزيت بيو",
    imageFirst: false,
  },
  {
    id: "peanut-amlou",
    label: "أملو الكاوكاو",
    title: "أملو الكاوكاو — كريمي وغني من سوس",
    description:
      "كاوكاو مطحون مع عسل طبيعي وزيت أركان — قوام كريمي وطعم أصيل يُحضّر على الطريقة التقليدية.",
    bullets: [
      "كاوكاو وعسل وأركان طبيعي",
      "تحضير حرفي بطيء",
      "مثالي للفطور والضيافة",
    ],
    price: 99,
    weight: "من 250 غ",
    imageSrc: `${IMG}/Cocoa_amlou.jpeg`,
    imageAlt: "أملو الكاوكاو تازارزيت بيو",
    imageFirst: true,
    badge: "جديد",
  },
];

export const bestSellers = [
  {
    id: "almond-amlou",
    name: "أملو باللوز",
    price: 119,
    weight: "من 250 غ",
    imageSrc: `${IMG}/almond-amlou.png`,
    imageAlt: "أملو باللوز تازارزيت بيو",
    rating: 4.9,
    reviewCount: 312,
    soldLabel: "الأكثر مبيعاً",
    isFeatured: true,
  },
  {
    id: "pistachio-amlou",
    name: "أملو بالفستق",
    price: 199,
    weight: "من 250 غ",
    imageSrc: `${IMG}/pistachio-amlou.png`,
    imageAlt: "أملو بالفستق تازارزيت بيو",
    rating: 5,
    reviewCount: 198,
    isNew: true,
  },
  {
    id: "mixed-nuts-honey",
    name: "مكسرات بالعسل",
    price: 129,
    weight: "250 غ",
    imageSrc: `${IMG}/mixed-nuts.png`,
    imageAlt: "مكسرات بالعسل تازارزيت بيو",
    rating: 4.9,
    reviewCount: 241,
  },
  {
    id: "argan-oil",
    name: "زيت أركان نقي",
    price: 299,
    weight: "من 250 مل",
    imageSrc: `${IMG}/argan-oil.png`,
    imageAlt: "زيت أركان مغربي تازارزيت بيو",
    rating: 4.8,
    reviewCount: 156,
  },
];

export const familyPacks = [
  {
    id: "premium-family-pack",
    slug: "premium-family-pack",
    title: "باقة العائلة — قيمة ممتازة",
    description: "تشكيلة 250غ/250مل — أملو، مكسرات، وأركان بسعر أوفر",
    price: 499,
    variant: "gold" as const,
    isPopular: true,
    highlight: "توفير عائلي",
    items: [
      { name: "أملو لوز 250غ", emoji: "🌰" },
      { name: "أملو فستق 250غ", emoji: "🥜" },
      { name: "مكسرات بالعسل", emoji: "🍯" },
      { name: "زيت أركان 250مل", emoji: "✨" },
    ],
  },
  {
    id: "family-breakfast",
    slug: "premium-family-pack",
    title: "باقة فطور العائلة",
    description: "أحجام 500غ و500مل — للعائلة الكبيرة",
    price: 899,
    variant: "olive" as const,
    highlight: "قيمة شهرية",
    items: [
      { name: "أملو لوز 500غ", emoji: "🫙" },
      { name: "أملو فستق 500غ", emoji: "🥜" },
      { name: "زيت أركان 500مل", emoji: "✨" },
    ],
  },
];

export const reviews = HOMEPAGE_REVIEWS_DARIJA;

export const transparencySteps = [
  {
    icon: "🌿",
    title: "المكونات",
    description: "لوز، فستق، عسل، زيت أركان — مكونات طبيعية 100% دون مواد حافظة أو إضافات صناعية.",
  },
  {
    icon: "📍",
    title: "المصدر",
    description: "نختار موردينا من مزارعي منطقة سوس — شراكات مباشرة مع منتجين محليين موثوقين.",
  },
  {
    icon: "👐",
    title: "التحضير",
    description: "تحضير تقليدي بطرق توارثناها — طحن بطيء وخلط يدوي يحافظ على الطعم والقيمة الغذائية.",
  },
  {
    icon: "📦",
    title: "التخزين والتغليف",
    description: "تغليف محكم يحافظ على النضارة — جاهز للشحن دون المساس بالجودة.",
  },
];

export const lifestyleMoments = [
  {
    emoji: "☀️",
    title: "فطور الأحد",
    description: "أملو وعسل على خبز البيت — دفء العائلة في كل لقمة",
    gradient: "from-amber-100 to-orange-50",
  },
  {
    emoji: "🫖",
    title: "ضيافة الضيوف",
    description: "منتجات طبيعية تعبّر عن الكرم المغربي الأصيل",
    gradient: "from-emerald-50 to-teal-50",
  },
  {
    emoji: "🌙",
    title: "رمضان والأعياد",
    description: "منتجات طبيعية تليق بموائد الإفطار والاحتفالات",
    gradient: "from-violet-50 to-purple-50",
  },
  {
    emoji: "💚",
    title: "صحة وعافية",
    description: "غذاء نقي من الطبيعة — بدون تعقيد، بدون إضافات",
    gradient: "from-green-50 to-lime-50",
  },
];

export const storyPillars = [
  {
    step: "01",
    title: "من قلب سوس",
    description: "منطقة غنية بأشجار الأركان والمراعي — حيث تبدأ قصة كل منتج.",
  },
  {
    step: "02",
    title: "تحضير حرفي",
    description: "طرق تقليدية يدوية — طحن، خلط، وتعبئة بعناية فائقة.",
  },
  {
    step: "03",
    title: "جودة موثوقة",
    description: "فحص كل دفعة قبل التغليف — لا نتنازل عن المعايير.",
  },
  {
    step: "04",
    title: "إلى بيتك",
    description: "توصيل لجميع مدن المغرب — الدفع عند الاستلام بكل ثقة.",
  },
];

export const faqs = [
  {
    q: "هل المنتجات طبيعية 100%؟",
    a: "نعم، جميع منتجاتنا طبيعية 100% دون إضافات صناعية أو حافظات. نختار مكوناتنا بعناية من منطقة سوس بالمغرب.",
  },
  {
    q: "كيف يتم الدفع؟",
    a: "الدفع عند الاستلام فقط. لا نطلب أي بطاقة بنكية أو دفع مسبق. تدفع المبلغ نقداً عند استلام طلبك.",
  },
  {
    q: "ما هي مدة التوصيل؟",
    a: "المدن الكبرى من 1–3 أيام عمل. باقي المدن من 3–5 أيام. نتصل بك لتأكيد الموعد قبل الشحن.",
  },
  {
    q: "هل لديكم باقات عائلية؟",
    a: "نعم — باقات قيمة عائلية بتشكيلات عملية وأسعار مناسبة، وليست علب هدايا فاخرة.",
  },
  {
    q: "هل يمكنني إرجاع المنتج؟",
    a: "في حال وجود مشكلة أو تلف أثناء الشحن، نلتزم بالاستبدال. تواصل خلال 24 ساعة من الاستلام.",
  },
  {
    q: "كيف أتتبع طلبي؟",
    a: "بعد الطلب سنتصل بك للتأكيد. يمكنك أيضاً مراسلتنا على واتساب لمعرفة حالة التوصيل.",
  },
];
