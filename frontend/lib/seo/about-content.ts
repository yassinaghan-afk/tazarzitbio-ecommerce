import type { Language } from "@/lib/i18n/types";
import { BUSINESS_LOCATION } from "@/lib/seo/business-location";

export type AboutCopy = {
  title: string;
  description: string;
  h1: string;
  lead: string;
  body: string[];
  valuesHeading: string;
  values: string[];
  napHeading: string;
  ctaLabel: string;
  ctaHref: string;
};

export function getAboutCopy(locale: Language): AboutCopy {
  if (locale === "fr") {
    return {
      title: "À propos | Tazarzit Bio — produits naturels du Souss",
      description:
        "Tazarzit Bio : Amlou, huile d’argan et miel naturel du Souss. Entreprise à Agadir, livraison nationale, paiement à la livraison. WhatsApp +212 642 370 050.",
      h1: "À propos de Tazarzit Bio",
      lead:
        "Tazarzit Bio propose des spécialités naturelles du Souss — Amlou, huile d’argan alimentaire, miel et fruits secs au miel — avec paiement à la livraison partout au Maroc.",
      body: [
        "Nous sélectionnons des ingrédients locaux et préparons des recettes traditionnelles sans conservateurs industriels, pour le petit-déjeuner, la réception et les cadeaux.",
        "Chaque commande est confirmée par téléphone avant l’expédition. Vous payez à la livraison — sans carte bancaire obligatoire.",
        "Notre ancrage est à Agadir (Souss-Massa). Nous livrons les grandes villes et destinations touristiques, y compris hôtels et riads après confirmation de l’adresse.",
      ],
      valuesHeading: "Ce qui nous définit",
      values: [
        "100 % naturel — sans additifs industriels",
        "Origine Souss — savoir-faire marocain",
        "Paiement à la livraison national",
        "Support WhatsApp AR / FR / EN",
      ],
      napHeading: "Coordonnées",
      ctaLabel: "Voir les produits",
      ctaHref: "/fr/products",
    };
  }
  if (locale === "en") {
    return {
      title: "About | Tazarzit Bio — natural Souss products",
      description:
        "Tazarzit Bio: Amlou, edible argan oil and natural honey from Souss. Based in Agadir, nationwide delivery, cash on delivery. WhatsApp +212 642 370 050.",
      h1: "About Tazarzit Bio",
      lead:
        "Tazarzit Bio offers natural Souss specialties — Amlou, edible argan oil, honey and honey nuts — with cash on delivery across Morocco.",
      body: [
        "We source local ingredients and prepare traditional recipes without industrial preservatives, for breakfast, hosting and gifts.",
        "Every order is confirmed by phone before shipping. You pay on delivery — no prepaid card required.",
        "We are based in Agadir (Souss-Massa) and deliver to major cities and tourist destinations, including hotels and riads after address confirmation.",
      ],
      valuesHeading: "What we stand for",
      values: [
        "100% natural — no industrial additives",
        "Souss origin — Moroccan craft",
        "Nationwide cash on delivery",
        "WhatsApp support in AR / FR / EN",
      ],
      napHeading: "Contact & location",
      ctaLabel: "Shop products",
      ctaHref: "/en/products",
    };
  }
  return {
    title: "من نحن | تازارزيت بيو — منتجات طبيعية من سوس",
    description:
      "تازارزيت بيو: أملو وزيت أركان وعسل طبيعي من سوس. مقرنا بأكادير، توصيل وطني والدفع عند الاستلام. واتساب +212 642 370 050.",
    h1: "من نحن — تازارزيت بيو",
    lead:
      "تازارزيت بيو تقدّم تخصصات طبيعية من سوس — أملو، زيت الأركان الغذائي، العسل والمكسرات بالعسل — مع الدفع عند الاستلام في جميع أنحاء المغرب.",
    body: [
      "نختار مكونات محلية ونحضّر وصفات تقليدية بدون مواد حافظة صناعية، للفطور والضيافة والهدايا.",
      "كل طلب يُؤكد هاتفياً قبل الشحن. تدفع عند الاستلام — بدون بطاقة مسبقة.",
      "مقرنا في أكادير (سوس ماسة). نوصل للمدن الكبرى والوجهات السياحية بما فيها الفنادق والرياض بعد تأكيد العنوان.",
    ],
    valuesHeading: "قيمنا",
    values: [
      "طبيعي 100% — بدون إضافات صناعية",
      "منشأ سوس — حرفية مغربية",
      "الدفع عند الاستلام في كل المغرب",
      "دعم واتساب بالعربية والفرنسية والإنجليزية",
    ],
    napHeading: "التواصل والموقع",
    ctaLabel: "تسوق المنتجات",
    ctaHref: "/products",
  };
}

export function aboutAddressLine(locale: Language): string {
  if (locale === "ar") return BUSINESS_LOCATION.addressDisplayAr;
  if (locale === "en") return BUSINESS_LOCATION.addressDisplayEn;
  return BUSINESS_LOCATION.addressDisplayFr;
}
