import { GuideArticle } from "@/components/seo/guide-article";

export type AmlouCityId = "casablanca" | "marrakech" | "agadir";

const CITIES: Record<
  AmlouCityId,
  {
    path: string;
    nameAr: string;
    nameFr: string;
    nameEn: string;
  }
> = {
  casablanca: {
    path: "/guide/amlou-casablanca",
    nameAr: "الدار البيضاء",
    nameFr: "Casablanca",
    nameEn: "Casablanca",
  },
  marrakech: {
    path: "/guide/amlou-marrakech",
    nameAr: "مراكش",
    nameFr: "Marrakech",
    nameEn: "Marrakech",
  },
  agadir: {
    path: "/guide/amlou-agadir",
    nameAr: "أكادير",
    nameFr: "Agadir",
    nameEn: "Agadir",
  },
};

export function getAmlouCityMeta(city: AmlouCityId) {
  const c = CITIES[city];
  return {
    path: c.path,
    title: `أملو في ${c.nameAr} — شراء أونلاين مع التوصيل | تازارزيت بيو`,
    description: `اطلب أملو طبيعي وأملو ملكي في ${c.nameAr} مع التوصيل إلى الباب والدفع عند الاستلام. تازارزيت بيو — منتجات من سوس. واتساب +212 642 370 050.`,
    ogTitle: `أملو في ${c.nameAr} — تازارزيت بيو`,
    ogDescription: `توصيل أملو إلى ${c.nameAr} مع الدفع عند الاستلام.`,
    keywords: [
      `أملو ${c.nameAr}`,
      `أملو ${c.nameFr}`,
      `amlou ${c.nameEn.toLowerCase()}`,
      "أملو المغرب",
      "acheter amlou",
      "تازارزيت بيو",
    ],
  };
}

export function AmlouCityGuidePage({ city }: { city: AmlouCityId }) {
  const c = CITIES[city];
  const title = `أملو في ${c.nameAr} — توصيل والدفع عند الاستلام`;

  return (
    <GuideArticle
      path={c.path}
      label={`أملو · ${c.nameAr}`}
      title={title}
      intro={`تبحث عن أملو في ${c.nameAr}؟ تازارزيت بيو توصّل أملو تقليدي وأملو ملكي من سوس إلى باب منزلك في ${c.nameAr}، مع تأكيد الطلب هاتفياً والدفع عند الاستلام. للطلب السريع عبر واتساب: +212 642 370 050.`}
      ctaHref="/amlouroyal"
      ctaLabel="اطلب أملو ملكي الآن"
      sections={[
        {
          heading: `كيف تشتري أملو أونلاين في ${c.nameAr}؟`,
          paragraphs: [
            `اختر المنتج من صفحة الأملو أو أملو ملكي، أكمل الطلب بعنوانك في ${c.nameAr}، ثم نؤكد معك بالهاتف قبل الشحن. الدفع عند الاستلام — بدون بطاقة مسبقة.`,
            "يمكنك أيضاً مراسلة واتساب مباشرة لطلب سريع أو استفسار عن الأحجام والتوفر.",
          ],
        },
        {
          heading: "لماذا أملو تازارزيت بيو؟",
          paragraphs: [
            "مكونات طبيعية من منطقة سوس، قوام كريمي مناسب للفطور والضيافة، وأحجام متعددة تناسب العائلة أو التجربة الأولى.",
            `التوصيل يغطي ${c.nameAr} وباقي مدن المغرب عبر شركاء التوصيل بعد تأكيد العنوان.`,
          ],
        },
        {
          heading: `Amlou à ${c.nameFr} (FR)`,
          paragraphs: [
            `Commandez l’Amlou et l’Amlou Royal Tazarzit Bio avec livraison à ${c.nameFr} et paiement à la livraison. WhatsApp : +212 642 370 050. Pages : /amlou et /amlouroyal.`,
          ],
        },
        {
          heading: `Amlou in ${c.nameEn} (EN)`,
          paragraphs: [
            `Order traditional Souss Amlou and Amlou Royal with delivery in ${c.nameEn}, cash on delivery after phone confirmation. WhatsApp: +212 642 370 050.`,
          ],
        },
      ]}
      faqs={[
        {
          q: `هل توصلون الأملو إلى ${c.nameAr}؟`,
          a: `نعم. نغطي ${c.nameAr} ضمن التوصيل الوطني في المغرب بعد تأكيد العنوان ورقم الهاتف.`,
        },
        {
          q: "هل الدفع عند الاستلام متاح؟",
          a: "نعم — الدفع عند الاستلام فقط بعد تأكيد الطلب. لا حاجة لبطاقة بنكية مسبقاً.",
        },
        {
          q: "ما أفضل منتج للبداية؟",
          a: "أملو ملكي هو العرض الرئيسي: أحجام متعددة، مكونات طبيعية من سوس، وتوصيل مع الدفع عند الاستلام.",
        },
        {
          q: "كيف أتواصل عبر واتساب؟",
          a: "راسلنا على +212 642 370 050 أو استخدم زر واتساب في الموقع لطلب أملو في مدينتك.",
        },
      ]}
    />
  );
}

export const AMLOU_CITY_GUIDE_PATHS = Object.values(CITIES).map((c) => c.path);
