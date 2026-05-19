/** Homepage content — swap with CMS/API later */

export const productShowcases = [
  {
    id: "almond-amlou",
    label: "أملو اللوز",
    title: "أملو باللوز — دفء سوس في كل ملعقة",
    description:
      "معجون لوز مطحون يدوياً مع عسل نقي وزيت أركان بكر — قوام كريمي غني وطعم أصيل يحضّر على الطريقة التقليدية.",
    bullets: [
      "لوز محلي مختار بعناية",
      "بدون مواد حافظة أو إضافات",
      "مثالي للفطور والضيافة",
    ],
    price: 109,
    comparePrice: 135,
    weight: "250 غ",
    imageSrc: "/products/almond-amlou.png",
    imageAlt: "أملو باللوز تازارزيت بيو — عبوة زجاجية فاخرة",
    imageFirst: false,
    badge: "الأكثر طلباً",
  },
  {
    id: "pistachio-amlou",
    label: "أملو الفستق",
    title: "أملو بالفستق — فخامة خضراء من المغرب",
    description:
      "فستق أخضر فاخر مطحون ببطء مع عسل وزيت أركان — لون طبيعي ونكهة راقية تليق بمائدة الضيافة المغربية.",
    bullets: [
      "فستق طبيعي 100%",
      "تحضير حرفي بطيء",
      "تغليف زجاجي أنيق للإهداء",
    ],
    price: 129,
    comparePrice: 160,
    weight: "250 غ",
    imageSrc: "/products/pistachio-amlou.png",
    imageAlt: "أملو بالفستق تازارزيت بيو",
    imageFirst: true,
    badge: "جديد",
  },
  {
    id: "mixed-nuts",
    label: "مكسرات بالعسل",
    title: "مكسرات بالعسل — قرمشة وعسل ذهبي",
    description:
      "مزيج فاخر من اللوز والجوز والفستق مغطى بعسل طبيعي كثيف — وجبة خفيفة فاخرة ولمسة ضيافة لا تُنسى.",
    bullets: [
      "عسل طبيعي من سوس",
      "مكسرات مختارة يدوياً",
      "مثالي مع الشاي والقهوة",
    ],
    price: 95,
    comparePrice: 115,
    weight: "250 غ",
    imageSrc: "/products/mixed-nuts.png",
    imageAlt: "مكسرات بالعسل تازارزيت بيو",
    imageFirst: false,
  },
  {
    id: "argan-oil",
    label: "زيت الأركان",
    title: "زيت أركان مغربي نقي — كنز الجمال والعافية",
    description:
      "زيت أركان بكر معصور على البارد من ثمار أشجار الأركان في سوس — للوجه والجسم والشعر، بجودة تستحق الثقة.",
    bullets: [
      "معصور على البارد",
      "100% نقي دون خلط",
      "للوجه والجسم والشعر",
    ],
    price: 149,
    comparePrice: 179,
    weight: "250 مل",
    imageSrc: "/products/argan-oil.png",
    imageAlt: "زيت أركان مغربي نقي تازارزيت بيو",
    imageFirst: true,
    badge: "طبيعي 100%",
  },
];

export const bestSellers = [
  {
    id: "almond-amlou",
    name: "أملو باللوز",
    price: 109,
    comparePrice: 135,
    weight: "250 غ",
    imageSrc: "/products/almond-amlou.png",
    imageAlt: "أملو باللوز تازارزيت بيو",
    rating: 4.9,
    reviewCount: 312,
    soldLabel: "الأكثر مبيعاً",
    isFeatured: true,
  },
  {
    id: "pistachio-amlou",
    name: "أملو بالفستق",
    price: 129,
    comparePrice: 160,
    weight: "250 غ",
    imageSrc: "/products/pistachio-amlou.png",
    imageAlt: "أملو بالفستق تازارزيت بيو",
    rating: 5,
    reviewCount: 198,
    isNew: true,
  },
  {
    id: "mixed-nuts",
    name: "مكسرات بالعسل",
    price: 95,
    comparePrice: 115,
    weight: "250 غ",
    imageSrc: "/products/mixed-nuts.png",
    imageAlt: "مكسرات بالعسل تازارزيت بيو",
    rating: 4.9,
    reviewCount: 241,
  },
  {
    id: "argan-oil",
    name: "زيت أركان نقي",
    price: 149,
    comparePrice: 179,
    weight: "250 مل",
    imageSrc: "/products/argan-oil.png",
    imageAlt: "زيت أركان مغربي تازارزيت بيو",
    rating: 4.8,
    reviewCount: 156,
  },
];

export const familyPacks = [
  {
    id: "gift-luxury",
    title: "علبة هدية فاخرة",
    description: "تغليف أنيق يليق بالمناسبات — عيد، زفاف، ضيافة",
    price: 249,
    comparePrice: 320,
    variant: "gold" as const,
    isPopular: true,
    highlight: "مثالية للإهداء",
    items: [
      { name: "أملو بالفستق", emoji: "🥜" },
      { name: "زيت أركان", emoji: "✨" },
      { name: "عسل طبيعي", emoji: "🍯" },
    ],
  },
  {
    id: "family-breakfast",
    title: "باقة فطور العائلة",
    description: "كل ما تحتاجه لمائدة فطور مغربية فاخرة",
    price: 399,
    comparePrice: 520,
    variant: "olive" as const,
    highlight: "ضيافة مغربية أصيلة",
    items: [
      { name: "أملو الكلاسيكي", emoji: "🫙" },
      { name: "أملو باللوز", emoji: "🌰" },
      { name: "عسل طبيعي", emoji: "🍯" },
      { name: "مكسرات بالعسل", emoji: "🥜" },
      { name: "زيت أركان", emoji: "✨" },
    ],
  },
];

export const reviews = [
  {
    id: "1",
    author: "فاطمة الزهراء",
    city: "الدار البيضاء",
    rating: 5,
    date: "مايو 2026",
    content:
      "أملو تازارزيت هو أفضل أملو جربته. الطعم طبيعي 100% والتغليف أنيق جداً. طلبت للعائلة وكررنا الطلب مرتين.",
    product: "أملو الكلاسيكي",
    avatar: "ف",
  },
  {
    id: "2",
    author: "يوسف بنعلي",
    city: "الرباط",
    rating: 5,
    date: "أبريل 2026",
    content:
      "علبة الهدية كانت مفاجأة رائعة في عيد الفطر. الجودة عالية والتوصيل سريع والدفع عند الاستلام مريح جداً.",
    product: "علبة هدية فاخرة",
    avatar: "ي",
  },
  {
    id: "3",
    author: "نادية السوسي",
    city: "أكادير",
    rating: 5,
    date: "مارس 2026",
    content:
      "من سوس وأعرف الجودة. تازارزيت بيو يستحق اسمه — زيت أركان حقيقي وعسل نقي. أنصح به بقوة.",
    product: "زيت أركان",
    avatar: "ن",
  },
  {
    id: "4",
    author: "كريم الحموي",
    city: "مراكش",
    rating: 5,
    date: "فبراير 2026",
    content:
      "باقة العائلة وفرت علينا الكثير. الفطور أصبح مناسبة خاصة كل أسبوع. منتجات فاخرة بسعر عادل.",
    product: "باقة فطور العائلة",
    avatar: "ك",
  },
];

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
    description: "تغليف محكم يحافظ على النضارة — جاهز للشحن والإهداء دون المساس بالجودة.",
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
    description: "علبة هدايا فاخرة تعبّر عن الكرم المغربي الأصيل",
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
    title: "جودة فاخرة",
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
    q: "هل علب الهدايا مناسبة للمناسبات؟",
    a: "بالتأكيد — مصممة للإهداء في العيد والأفراح والضيافة، بتغليف فاخر يليق بالمناسبة.",
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
