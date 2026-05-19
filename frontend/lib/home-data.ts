/** Placeholder homepage content — swap with CMS/API later */

export const bestSellers = [
  {
    id: "amlou-classic",
    name: "أملو تازارزيت الكلاسيكي",
    price: 89,
    comparePrice: 110,
    weight: "250 غ",
    gradient: "from-amber-50 via-orange-50 to-amber-100",
    emoji: "🫙",
    rating: 4.9,
    reviewCount: 312,
    soldLabel: "الأكثر مبيعاً",
    isFeatured: true,
  },
  {
    id: "amlou-pistachio",
    name: "أملو بالفستق",
    price: 129,
    comparePrice: 160,
    weight: "250 غ",
    gradient: "from-green-50 via-emerald-50 to-lime-100",
    emoji: "🥜",
    rating: 5,
    reviewCount: 198,
    isNew: true,
  },
  {
    id: "argan-oil",
    name: "زيت أركان طبيعي",
    price: 149,
    weight: "100 مل",
    gradient: "from-yellow-50 via-amber-50 to-orange-50",
    emoji: "✨",
    rating: 4.8,
    reviewCount: 156,
  },
  {
    id: "honey",
    name: "عسل طبيعي من سوس",
    price: 75,
    comparePrice: 95,
    weight: "500 غ",
    gradient: "from-yellow-100 via-amber-100 to-orange-50",
    emoji: "🍯",
    rating: 4.9,
    reviewCount: 241,
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
