import { AmlouHubClient } from "@/components/seo/amlou-hub-client";
import type { Language } from "@/lib/i18n/types";
import { AMLOU_ROYAL_SLUG } from "@/lib/products/amlou-royal";
import { toPublicProduct } from "@/lib/products/catalog";
import { getMergedCatalog } from "@/lib/products/cms-catalog";
import { getListingProducts } from "@/lib/products/listing";
import { localizedPath } from "@/lib/seo/locale";

const COPY: Record<
  Language,
  {
    title: string;
    label: string;
    intro: string;
    ctaLabel: string;
    sections: { heading: string; paragraphs: string[] }[];
    faqs: { q: string; a: string }[];
  }
> = {
  ar: {
    title: "أملو طبيعي من سوس — شراء أونلاين في المغرب",
    label: "أملو · المغرب",
    intro:
      "تبحث عن أملو؟ تازارزيت بيو تقدّم أملو تقليدي وأملو ملكي من منطقة سوس، بمكونات طبيعية وتوصيل داخل المغرب مع الدفع عند الاستلام.",
    ctaLabel: "اطلب أملو ملكي الآن",
    sections: [
      {
        heading: "فوائد الأملو الصحية",
        paragraphs: [
          "الأملو مصدر طبيعي للطاقة بفضل اللوز والمكسرات وزيت الأركان. مناسب للفطور، بعد التمرين، أو كوجبة خفيفة مغذية دون مواد حافظة صناعية.",
          "يساعد على الشبع ويقدّم دهوناً جيدة وفيتامينات من مكونات سوس التقليدية — مثالي للعائلة والضيافة.",
        ],
      },
      {
        heading: "طريقة الاستهلاك",
        paragraphs: [
          "يُدهن على الخبز أو الملوي أو البغرير، ويُقدَّم مع الشاي المغربي. يمكن تناوله بالملعقة أو إضافته للزبادي.",
          "يُحفظ بعد الفتح في مكان بارد وجاف، بأدوات نظيفة للحفاظ على الجودة.",
        ],
      },
      {
        heading: "لماذا تازارزيت بيو؟",
        paragraphs: [
          "مكونات واضحة من سوس، عروض بأحجام متعددة، توصيل لكل المدن، والدفع عند الاستلام بعد تأكيد الطلب هاتفياً.",
        ],
      },
    ],
    faqs: [
      {
        q: "أين أشتري أملو أونلاين في المغرب؟",
        a: "من متجر تازارزيت بيو — صفحة أملو ملكي أو قائمة المنتجات — مع الدفع عند الاستلام.",
      },
      {
        q: "هل التوصيل لكل المدن؟",
        a: "نعم، نغطي المدن المغربية عبر خدمة التوصيل بعد تأكيد العنوان.",
      },
      {
        q: "هل الأملو طبيعي بدون مواد حافظة؟",
        a: "نعم — نركز على مكونات طبيعية دون إضافات صناعية، مع شفافية في قائمة المكونات على صفحة المنتج.",
      },
    ],
  },
  fr: {
    title: "Amlou du Souss — acheter en ligne au Maroc",
    label: "Amlou · Maroc",
    intro:
      "Vous cherchez de l’Amlou ? Tazarzit Bio propose de l’Amlou traditionnel et l’Amlou Royal du Souss, en livraison partout au Maroc avec paiement à la livraison.",
    ctaLabel: "Commander Amlou Royal",
    sections: [
      {
        heading: "Bienfaits de l’Amlou",
        paragraphs: [
          "L’Amlou est une source d’énergie naturelle grâce aux amandes, fruits à coque et huile d’argan. Idéal au petit-déjeuner ou en collation, sans conservateurs industriels.",
          "Il apporte satiété et bons lipides issus du terroir du Souss — parfait pour la famille et pour recevoir.",
        ],
      },
      {
        heading: "Comment consommer",
        paragraphs: [
          "À tartiner sur pain, msemen ou baghrir, avec du thé marocain. À la cuillère ou dans un yaourt.",
          "Après ouverture, conserver au sec et au frais, avec des ustensiles propres.",
        ],
      },
      {
        heading: "Pourquoi Tazarzit Bio ?",
        paragraphs: [
          "Ingrédients clairs du Souss, plusieurs formats, livraison nationale et paiement à la livraison après confirmation téléphonique.",
        ],
      },
    ],
    faqs: [
      {
        q: "Où acheter de l’Amlou en ligne au Maroc ?",
        a: "Sur Tazarzit Bio — page Amlou Royal ou catalogue — avec paiement à la livraison.",
      },
      {
        q: "Livrez-vous dans toutes les villes ?",
        a: "Oui, après confirmation de l’adresse nous expédions via nos partenaires.",
      },
      {
        q: "L’Amlou est-il sans conservateurs ?",
        a: "Oui — nous privilégions des ingrédients naturels, listés clairement sur la fiche produit.",
      },
    ],
  },
  en: {
    title: "Natural Souss Amlou — buy online in Morocco",
    label: "Amlou · Morocco",
    intro:
      "Looking for Amlou? Tazarzit Bio offers traditional Amlou and Amlou Royal from Souss, with nationwide Moroccan delivery and cash on delivery.",
    ctaLabel: "Order Amlou Royal",
    sections: [
      {
        heading: "Health benefits of Amlou",
        paragraphs: [
          "Amlou is a natural energy source from almonds, nuts and argan oil — great for breakfast or a snack, without industrial preservatives.",
          "It supports satiety and provides wholesome fats from Souss ingredients — ideal for family tables and hosting.",
        ],
      },
      {
        heading: "How to enjoy it",
        paragraphs: [
          "Spread on bread, msemen or baghrir with Moroccan tea. Eat by the spoon or stir into yogurt.",
          "After opening, store cool and dry and use clean utensils.",
        ],
      },
      {
        heading: "Why Tazarzit Bio?",
        paragraphs: [
          "Clear Souss ingredients, multiple sizes, nationwide delivery, and cash on delivery after phone confirmation.",
        ],
      },
    ],
    faqs: [
      {
        q: "Where can I buy Amlou online in Morocco?",
        a: "On Tazarzit Bio — the Amlou Royal page or catalog — with cash on delivery.",
      },
      {
        q: "Do you deliver to all cities?",
        a: "Yes. After confirming the address we ship across Morocco with delivery partners.",
      },
      {
        q: "Is Amlou free from preservatives?",
        a: "Yes — we focus on natural ingredients listed clearly on each product page.",
      },
    ],
  },
};

export async function AmlouHubPage({ locale }: { locale: Language }) {
  const copy = COPY[locale];
  const catalog = await getMergedCatalog();
  const listing = getListingProducts(catalog.map(toPublicProduct));
  const amlouProducts = listing
    .filter((p) => p.category === "amlou" || p.slug === AMLOU_ROYAL_SLUG)
    .slice(0, 6);

  const path = localizedPath(locale, "/amlou");

  return (
    <AmlouHubClient
      locale={locale}
      path={path}
      title={copy.title}
      label={copy.label}
      intro={copy.intro}
      sections={copy.sections}
      faqs={copy.faqs}
      products={amlouProducts}
      ctaHref={localizedPath(locale, "/amlouroyal")}
      ctaLabel={copy.ctaLabel}
    />
  );
}
