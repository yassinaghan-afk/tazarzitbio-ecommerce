import type { Language } from "@/lib/i18n/types";

type FaqItem = { q: string; a: string };

/** Homepage FAQs for FAQPage schema (matches i18n faq keys). */
export const DEFAULT_HOME_FAQS: Record<Language, readonly FaqItem[]> = {
  ar: [
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
      q: "ما هي المنتجات المتوفرة؟",
      a: "أملو بأنواعه، زيت الأركان، العسل الطبيعي، والمكسرات بالعسل — كل المنتوجات طبيعية والدفع عند الاستلام.",
    },
    {
      q: "هل يمكنني إرجاع المنتج؟",
      a: "في حال وجود مشكلة أو تلف أثناء الشحن، نلتزم بالاستبدال. تواصل خلال 24 ساعة من الاستلام.",
    },
    {
      q: "كيف أتتبع طلبي؟",
      a: "بعد الطلب سنتصل بك للتأكيد. يمكنك أيضاً مراسلتنا على واتساب لمعرفة حالة التوصيل.",
    },
  ],
  fr: [
    {
      q: "Les produits sont-ils 100 % naturels ?",
      a: "Oui. Tous nos produits sont 100 % naturels, sans additifs industriels ni conservateurs. Nous sélectionnons nos ingrédients avec soin dans la région du Souss au Maroc.",
    },
    {
      q: "Comment se passe le paiement ?",
      a: "Paiement à la livraison uniquement. Aucune carte bancaire ni paiement anticipé. Vous réglez en espèces à la réception.",
    },
    {
      q: "Quels sont les délais de livraison ?",
      a: "Grandes villes : 1 à 3 jours ouvrés. Autres villes : 3 à 5 jours. Nous vous appelons pour confirmer avant l’expédition.",
    },
    {
      q: "Quels produits proposez-vous ?",
      a: "Amlou (plusieurs variétés), huile d’argan, miel naturel et fruits secs au miel — produits naturels avec paiement à la livraison.",
    },
    {
      q: "Puis-je retourner un produit ?",
      a: "En cas de problème ou de dommage pendant le transport, nous nous engageons au remplacement. Contactez-nous dans les 24 h après réception.",
    },
    {
      q: "Comment suivre ma commande ?",
      a: "Après la commande, nous vous appelons pour confirmer. Vous pouvez aussi nous écrire sur WhatsApp pour le suivi.",
    },
  ],
  en: [
    {
      q: "Are the products 100% natural?",
      a: "Yes. All our products are 100% natural with no industrial additives or preservatives. We carefully source ingredients from Morocco’s Souss region.",
    },
    {
      q: "How does payment work?",
      a: "Cash on delivery only. No card or prepaid payment required. You pay cash when you receive your order.",
    },
    {
      q: "What are the delivery times?",
      a: "Major cities: 1–3 business days. Other cities: 3–5 days. We call you to confirm before shipping.",
    },
    {
      q: "What products do you offer?",
      a: "Amlou varieties, argan oil, natural honey, and honey nuts — all natural with cash on delivery.",
    },
    {
      q: "Can I return a product?",
      a: "If there is a problem or damage in transit, we replace it. Contact us within 24 hours of delivery.",
    },
    {
      q: "How do I track my order?",
      a: "After ordering we call to confirm. You can also message us on WhatsApp for delivery status.",
    },
  ],
};

/** @deprecated use getDefaultHomeFaqs(locale) */
export const DEFAULT_HOME_FAQS_AR = DEFAULT_HOME_FAQS.ar;

export function getDefaultHomeFaqs(locale: Language): FaqItem[] {
  return [...DEFAULT_HOME_FAQS[locale]];
}

/** Catalog /products FAQs — direct answers for AEO. */
export const CATALOG_FAQS: Record<Language, readonly FaqItem[]> = {
  ar: [
    {
      q: "من أين أبدأ إذا أردت شراء أملو أونلاين؟",
      a: "ابدأ بصفحة الأملو أو أملو ملكي، اختر الحجم، أكمل الطلب، ثم نؤكد معك بالهاتف قبل الشحن. الدفع عند الاستلام في كل مدن المغرب.",
    },
    {
      q: "هل التوصيل يشمل الفنادق والرياض؟",
      a: "نعم — نوصل للعناوين السكنية والفنادق والرياض بعد تأكيد العنوان ورقم الهاتف، مع الدفع عند الاستلام.",
    },
    {
      q: "ما الفرق بين أملو ملكي وأملو اللوز؟",
      a: "أملو ملكي خليط فاخر من مكسرات متعددة وزيت أركان (قنينة 500 غ). أملو اللوز معجون لوز تقليدي مع عسل وزيت أركان بعدة أحجام.",
    },
    {
      q: "هل يوجد سكر مضاف؟",
      a: "لا نضيف سكراً مكرراً. الحلاوة تأتي من العسل الطبيعي عندما يُستخدم في الوصفة.",
    },
  ],
  fr: [
    {
      q: "Par où commencer pour acheter de l’Amlou en ligne ?",
      a: "Ouvrez la page Amlou ou Amlou Royal, choisissez le format, validez la commande — nous confirmons par téléphone avant l’envoi. Paiement à la livraison partout au Maroc.",
    },
    {
      q: "Livrez-vous aux hôtels et riads ?",
      a: "Oui — adresses domicile, hôtels et riads après confirmation de l’adresse et du téléphone, avec paiement à la livraison.",
    },
    {
      q: "Quelle différence entre Amlou Royal et Amlou aux amandes ?",
      a: "Amlou Royal est un mélange premium de plusieurs noix et huile d’argan (flacon 500 g). L’Amlou aux amandes est une pâte traditionnelle amandes–miel–argan en plusieurs formats.",
    },
    {
      q: "Y a-t-il du sucre ajouté ?",
      a: "Non. Pas de sucre raffiné ajouté — la douceur vient uniquement du miel naturel lorsqu’il est utilisé.",
    },
  ],
  en: [
    {
      q: "Where should I start to buy Amlou online?",
      a: "Open the Amlou or Amlou Royal page, pick a size, place the order — we confirm by phone before shipping. Cash on delivery across Morocco.",
    },
    {
      q: "Do you deliver to hotels and riads?",
      a: "Yes — homes, hotels and riads after address and phone confirmation, with cash on delivery.",
    },
    {
      q: "What’s the difference between Amlou Royal and almond Amlou?",
      a: "Amlou Royal is a premium multi-nut blend with argan oil (500 g jar). Almond Amlou is the classic almond–honey–argan paste in several sizes.",
    },
    {
      q: "Is there added sugar?",
      a: "No refined sugar is added. Sweetness comes only from natural honey when used in the recipe.",
    },
  ],
};

export function getCatalogFaqs(locale: Language): FaqItem[] {
  return [...CATALOG_FAQS[locale]];
}

/** Guide index FAQs */
export const GUIDE_INDEX_FAQS: Record<Language, readonly FaqItem[]> = {
  ar: [
    {
      q: "ما هي أدلة تازارزيت بيو؟",
      a: "مقالات قصيرة تشرح الأملو وزيت الأركان الغذائي والعسل الطبيعي من سوس، لمساعدتك قبل الشراء ولإجابات واضحة لمحركات البحث.",
    },
    {
      q: "هل يمكنني الطلب بعد قراءة الدليل؟",
      a: "نعم — من كل دليل روابط مباشرة لصفحات المنتجات مع الدفع عند الاستلام في المغرب.",
    },
  ],
  fr: [
    {
      q: "Que sont les guides Tazarzit Bio ?",
      a: "Des articles courts sur l’Amlou, l’huile d’argan alimentaire et le miel naturel du Souss — pour comprendre avant d’acheter et pour des réponses claires aux moteurs de recherche.",
    },
    {
      q: "Puis-je commander après avoir lu un guide ?",
      a: "Oui — chaque guide renvoie vers les fiches produits avec paiement à la livraison au Maroc.",
    },
  ],
  en: [
    {
      q: "What are Tazarzit Bio guides?",
      a: "Short articles explaining Amlou, edible argan oil and natural Souss honey — to help you before buying and to give clear answers for search engines.",
    },
    {
      q: "Can I order after reading a guide?",
      a: "Yes — each guide links to product pages with cash on delivery in Morocco.",
    },
  ],
};

export function getGuideIndexFaqs(locale: Language): FaqItem[] {
  return [...GUIDE_INDEX_FAQS[locale]];
}
