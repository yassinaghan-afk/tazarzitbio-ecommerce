import type { Language } from "@/lib/i18n/types";

type L10n = { ar: string; fr: string; en: string };

function pick(text: L10n, locale: Language): string {
  if (locale === "fr") return text.fr;
  if (locale === "en") return text.en;
  return text.ar;
}

const CITIES: Record<string, L10n> = {
  مراكش: { ar: "مراكش", fr: "Marrakech", en: "Marrakech" },
  "الدار البيضاء": {
    ar: "الدار البيضاء",
    fr: "Casablanca",
    en: "Casablanca",
  },
  أكادير: { ar: "أكادير", fr: "Agadir", en: "Agadir" },
  الرباط: { ar: "الرباط", fr: "Rabat", en: "Rabat" },
  طنجة: { ar: "طنجة", fr: "Tanger", en: "Tangier" },
  فاس: { ar: "فاس", fr: "Fès", en: "Fez" },
  العيون: { ar: "العيون", fr: "Laâyoune", en: "Laayoune" },
  وجدة: { ar: "وجدة", fr: "Oujda", en: "Oujda" },
};

const MONTHS: Record<string, L10n> = {
  يناير: { ar: "يناير", fr: "janvier", en: "January" },
  فبراير: { ar: "فبراير", fr: "février", en: "February" },
  مارس: { ar: "مارس", fr: "mars", en: "March" },
  أبريل: { ar: "أبريل", fr: "avril", en: "April" },
  ماي: { ar: "ماي", fr: "mai", en: "May" },
  يونيو: { ar: "يونيو", fr: "juin", en: "June" },
  يوليوز: { ar: "يوليوز", fr: "juillet", en: "July" },
  غشت: { ar: "غشت", fr: "août", en: "August" },
  شتنبر: { ar: "شتنبر", fr: "septembre", en: "September" },
  أكتوبر: { ar: "أكتوبر", fr: "octobre", en: "October" },
  نونبر: { ar: "نونبر", fr: "novembre", en: "November" },
  دجنبر: { ar: "دجنبر", fr: "décembre", en: "December" },
};

const PRODUCTS: Record<string, L10n> = {
  "أملو باللوز": {
    ar: "أملو باللوز",
    fr: "Amlou aux amandes",
    en: "Almond Amlou",
  },
  "باقة العائلة": {
    ar: "باقة العائلة",
    fr: "Pack famille",
    en: "Family pack",
  },
  "زيت أركان": {
    ar: "زيت أركان",
    fr: "Huile d'argan",
    en: "Argan oil",
  },
  "مكسرات بالعسل": {
    ar: "مكسرات بالعسل",
    fr: "Fruits secs au miel",
    en: "Nuts with honey",
  },
  "أملو ملكي": {
    ar: "أملو ملكي",
    fr: "Amlou Royal",
    en: "Amlou Royal",
  },
};

/** Review body copy keyed by review id */
const REVIEW_CONTENT: Record<string, L10n> = {
  "alm-1": {
    ar: "وصلني الطلب فمراكش فحال ما شفت فالصور، الأملو بنين بزاف والتغليف نقي.",
    fr: "Commande reçue à Marrakech comme sur les photos — amlou délicieux et emballage soigné.",
    en: "Order arrived in Marrakech just like the photos — delicious amlou and clean packaging.",
  },
  "alm-2": {
    ar: "طلبت أملو اللوز للدار، عجب الواليدة بزاف خصوصاً مع الفطور.",
    fr: "J'ai commandé l'amlou aux amandes pour la maison — maman l'adore surtout au petit-déjeuner.",
    en: "Ordered almond amlou for home — my mother loves it especially at breakfast.",
  },
  "alm-3": {
    ar: "القومة كريمة والعسل باين طبيعي، غادي نعاود نطلب منكم.",
    fr: "Texture crémeuse et miel clairement naturel — je recommanderai chez vous.",
    en: "Creamy texture and clearly natural honey — I'll order again.",
  },
  "pis-1": {
    ar: "أملو الفستق طعمو زوين واللون طبيعي، ماشي بحال ديال السوق.",
    fr: "L'amlou pistache a un goût excellent et une couleur naturelle — pas comme au marché.",
    en: "Pistachio amlou tastes great with a natural color — not like market versions.",
  },
  "pis-2": {
    ar: "جربناه مع الملوي والشاي، الضيوف عجبهم بزاف.",
    fr: "On l'a goûté avec msemen et thé — les invités ont adoré.",
    en: "Tried it with msemen and tea — guests loved it.",
  },
  "arg-1": {
    ar: "زيت أركان باين طبيعي والريحة ديالو نقية، غادي نعاود نطلب.",
    fr: "Huile d'argan clairement naturelle, odeur pure — je recommanderai.",
    en: "Clearly natural argan oil with a pure scent — I'll order again.",
  },
  "arg-2": {
    ar: "توصيل لالعيون مزيان والزيت أصلي من سوس.",
    fr: "Livraison à Laâyoune impeccable et huile authentique du Souss.",
    en: "Great delivery to Laayoune and authentic Souss oil.",
  },
  "nut-1": {
    ar: "المكسرات مقرمشة والعسل كثيف، مزيان مع أتاي المغربي.",
    fr: "Fruits secs croquants et miel dense — parfait avec le thé marocain.",
    en: "Crunchy nuts and thick honey — great with Moroccan tea.",
  },
  "nut-2": {
    ar: "جاني الطلب فوقدة فنفس الأسبوع، التغليف مرتب.",
    fr: "Commande arrivée à Oujda dans la même semaine, emballage soigné.",
    en: "Order reached Oujda the same week, neat packaging.",
  },
  "dag-1": {
    ar: "عسل الدغموس طبيعي وكثيف، الذوق أصيل من سوس.",
    fr: "Miel de daghmous naturel et dense — goût authentique du Souss.",
    en: "Natural thick daghmous honey — authentic Souss taste.",
  },
  "dag-2": {
    ar: "جاني الطلب مرتب والعسل بنين بزاف مع الفطور.",
    fr: "Commande bien présentée et miel délicieux au petit-déjeuner.",
    en: "Neat order and delicious honey with breakfast.",
  },
  "thym-1": {
    ar: "عسل الزعتر ريحتو نقية وبنين، باين بلي طبيعي.",
    fr: "Miel de thym à l'odeur pure et savoureux — clairement naturel.",
    en: "Thyme honey with a pure scent and great taste — clearly natural.",
  },
  "thym-2": {
    ar: "كنستعملو فالدار مع الشاي، العائلة عجبها.",
    fr: "On l'utilise à la maison avec le thé — la famille adore.",
    en: "We use it at home with tea — the family loves it.",
  },
  "euc-1": {
    ar: "عسل الأوكالبتوس خفيف وطبيعي، التغليف أنيق.",
    fr: "Miel d'eucalyptus léger et naturel, emballage élégant.",
    en: "Light natural eucalyptus honey, elegant packaging.",
  },
  "euc-2": {
    ar: "ثمن معقول والجودة مزيانة، غادي نعاود نطلب.",
    fr: "Prix raisonnable et bonne qualité — je recommanderai.",
    en: "Fair price and good quality — I'll order again.",
  },
  "pnut-1": {
    ar: "أملو الكاوكاو بنين بزاف وقومتو كريمة، ماشي بحال ديال السوق.",
    fr: "Amlou cacao délicieux et crémeux — pas comme au marché.",
    en: "Cocoa amlou is delicious and creamy — not like market versions.",
  },
  "pnut-2": {
    ar: "جربناه مع الملوي، الضيوف عجبهم بزاف.",
    fr: "On l'a goûté avec msemen — les invités ont adoré.",
    en: "Tried it with msemen — guests loved it.",
  },
  "fam-1": {
    ar: "الباقة العائلية عملية بثمن معقول، الفطور ديال الشهر تساهل.",
    fr: "Le pack famille est pratique et bien prix — le petit-déjeuner du mois est réglé.",
    en: "The family pack is practical and fair-priced — breakfast for the month is sorted.",
  },
  "fam-2": {
    ar: "تشكيلة كاملة فطلبة وحدة، التوفير باين والجودة مزيانة.",
    fr: "Assortiment complet en une commande — économies visibles et bonne qualité.",
    en: "Full assortment in one order — clear savings and good quality.",
  },
  h1: {
    ar: "وصلني الطلب فمراكش فحال ما شفت فالصور، الأملو بنين بزاف والتغليف نقي.",
    fr: "Commande reçue à Marrakech comme sur les photos — amlou délicieux et emballage soigné.",
    en: "Order arrived in Marrakech just like the photos — delicious amlou and clean packaging.",
  },
  h2: {
    ar: "الباقة العائلية عملية بثمن معقول، الفطور ديال الشهر تساهل.",
    fr: "Le pack famille est pratique et bien prix — le petit-déjeuner du mois est réglé.",
    en: "The family pack is practical and fair-priced — breakfast for the month is sorted.",
  },
  h3: {
    ar: "زيت أركان باين طبيعي والريحة ديالو نقية، غادي نعاود نطلب.",
    fr: "Huile d'argan clairement naturelle, odeur pure — je recommanderai.",
    en: "Clearly natural argan oil with a pure scent — I'll order again.",
  },
  h4: {
    ar: "جاني الطلب فوقدة فنفس الأسبوع، التغليف مرتب.",
    fr: "Commande arrivée à Oujda dans la même semaine, emballage soigné.",
    en: "Order reached Oujda the same week, neat packaging.",
  },
  "roy-1": {
    ar: "أملو ملكي فاخر بزاف، المكسرات باينة وزيت الأركان كيعطي قومة زوينة للفطور.",
    fr: "Amlou Royal vraiment premium — les noix se voient et l'argan donne une belle texture au petit-déjeuner.",
    en: "Truly premium Amlou Royal — nuts are visible and argan gives a lovely breakfast texture.",
  },
  "roy-2": {
    ar: "طلبت قنينتين، العائلة كلها عجبتها، طبيعي بلا مواد حافظة.",
    fr: "J'ai pris deux pots — toute la famille a adoré, naturel sans conservateurs.",
    en: "Ordered two jars — the whole family loved it, natural with no preservatives.",
  },
  "roy-3": {
    ar: "التغليف مرتب والطعم غني، مثالي للضيافة مع الشاي.",
    fr: "Emballage soigné et goût riche — parfait pour recevoir avec le thé.",
    en: "Neat packaging and rich taste — perfect for hosting with tea.",
  },
  "roy-4": {
    ar: "منتج مغربي أصيل، الوزن 500غ والقوام كثيف كما فالعلبة.",
    fr: "Produit marocain authentique — 500 g et texture dense comme sur le pot.",
    en: "Authentic Moroccan product — 500 g with a dense texture just like the jar.",
  },
};

export function localizeCity(city: string, locale: Language): string {
  const mapped = CITIES[city];
  return mapped ? pick(mapped, locale) : city;
}

export function localizeReviewDate(date: string, locale: Language): string {
  if (locale === "ar") return date;
  let out = date;
  for (const [ar, l10n] of Object.entries(MONTHS)) {
    if (out.includes(ar)) out = out.replace(ar, pick(l10n, locale));
  }
  return out;
}

export function localizeReviewProduct(
  product: string | undefined,
  locale: Language,
): string {
  if (!product) return "";
  const mapped = PRODUCTS[product];
  return mapped ? pick(mapped, locale) : product;
}

export function localizeReviewContent(
  id: string,
  fallback: string,
  locale: Language,
): string {
  const mapped = REVIEW_CONTENT[id];
  if (!mapped) return fallback;
  return pick(mapped, locale);
}

export function localizeReviewFields(
  review: {
    id: string;
    city: string;
    date: string;
    content: string;
    product?: string;
  },
  locale: Language,
) {
  return {
    city: localizeCity(review.city, locale),
    date: localizeReviewDate(review.date, locale),
    content: localizeReviewContent(review.id, review.content, locale),
    product: localizeReviewProduct(review.product, locale),
  };
}
