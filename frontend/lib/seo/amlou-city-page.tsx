import type { Metadata } from "next";

import { GuideArticle } from "@/components/seo/guide-article";
import type { Language } from "@/lib/i18n/types";
import {
  AMLOU_CITIES,
  amlouCityPath,
  getAmlouCity,
  type AmlouCity,
} from "@/lib/seo/amlou-cities";
import {
  absoluteLocalizedUrl,
  hreflangLanguages,
  localizedPath,
  ogLocale,
} from "@/lib/seo/locale";

export {
  AMLOU_CITIES,
  amlouCityPath,
  getAmlouCity,
  type AmlouCity,
} from "@/lib/seo/amlou-cities";

export function getAmlouCityMetadata(
  city: AmlouCity,
  locale: Language,
): Metadata {
  const path = amlouCityPath(city.slug);
  const name =
    locale === "fr" ? city.nameFr : locale === "en" ? city.nameEn : city.nameAr;

  const title =
    locale === "fr"
      ? `Amlou à ${name} — livraison COD | Tazarzit Bio`
      : locale === "en"
        ? `Amlou in ${name} — COD delivery | Tazarzit Bio`
        : `أملو في ${name} — توصيل والدفع عند الاستلام | تازارزيت بيو`;

  const description =
    locale === "fr"
      ? `Commandez Amlou et Amlou Royal à ${name} avec livraison à domicile et paiement à la livraison. WhatsApp +212 642 370 050.`
      : locale === "en"
        ? `Order Amlou and Amlou Royal in ${name} with doorstep delivery and cash on delivery. WhatsApp +212 642 370 050.`
        : `اطلب أملو وأملو ملكي في ${name} مع التوصيل إلى الباب والدفع عند الاستلام. واتساب +212 642 370 050.`;

  return {
    title,
    description,
    keywords: [
      `أملو ${city.nameAr}`,
      `amlou ${city.nameFr}`,
      `amlou ${city.nameEn}`,
      "أملو المغرب",
      "acheter amlou",
      "تازارزيت بيو",
    ],
    alternates: {
      canonical: absoluteLocalizedUrl(locale, path),
      languages: hreflangLanguages(path),
    },
    openGraph: {
      title,
      description,
      url: absoluteLocalizedUrl(locale, path),
      locale: ogLocale(locale),
    },
  };
}

export function AmlouCityGuidePage({
  city,
  locale,
}: {
  city: AmlouCity;
  locale: Language;
}) {
  const path = localizedPath(locale, amlouCityPath(city.slug));
  const name =
    locale === "fr" ? city.nameFr : locale === "en" ? city.nameEn : city.nameAr;
  const ctaHref = localizedPath(locale, "/amlouroyal");
  const hubHref = localizedPath(locale, "/amlou");
  const homeHref = localizedPath(locale, "/");
  const homeLabel =
    locale === "fr" ? "Accueil" : locale === "en" ? "Home" : "الرئيسية";
  const hubLabel = "Amlou";
  const crumbs = [
    { name: homeLabel, path: homeHref },
    { name: hubLabel, path: hubHref },
    { name, path },
  ];
  const touristNote = city.tourist
    ? locale === "fr"
      ? ` ${name} est une destination touristique — idéal pour un Amlou authentique du Souss pendant votre séjour ou pour offrir.`
      : locale === "en"
        ? ` ${name} is a tourist destination — perfect for authentic Souss Amlou during your stay or as a gift.`
        : ` ${name} وجهة سياحية — مناسبة لأملو أصيل من سوس أثناء الإقامة أو كهدية.`
    : "";

  if (locale === "fr") {
    return (
      <GuideArticle
        path={path}
        crumbs={crumbs}
        secondaryHref={hubHref}
        secondaryLabel="Voir l’Amlou"
        label={`Amlou · ${name}`}
        title={`Amlou à ${name} — livraison et paiement à la livraison`}
        intro={`Vous cherchez de l’Amlou à ${name} ? Tazarzit Bio livre l’Amlou traditionnel et l’Amlou Royal du Souss à domicile à ${name}, après confirmation téléphonique, avec paiement à la livraison.${touristNote} WhatsApp : +212 642 370 050.`}
        ctaHref={ctaHref}
        ctaLabel="Commander Amlou Royal"
        sections={[
          {
            heading: `Comment acheter de l’Amlou en ligne à ${name} ?`,
            paragraphs: [
              `Choisissez l’offre sur la page Amlou ou Amlou Royal, indiquez votre adresse à ${name}, nous confirmons par téléphone puis expédions. Paiement à la livraison — sans carte bancaire.`,
              "Vous pouvez aussi écrire sur WhatsApp pour une commande rapide ou une question sur les formats.",
            ],
          },
          {
            heading: "Pourquoi Tazarzit Bio ?",
            paragraphs: [
              "Ingrédients naturels du Souss, textures crémeuses pour le petit-déjeuner et la réception, plusieurs formats.",
              `Livraison nationale incluant ${name} via nos partenaires après confirmation de l’adresse.`,
            ],
          },
        ]}
        faqs={[
          {
            q: `Livrez-vous l’Amlou à ${name} ?`,
            a: `Oui. ${name} est couverte dans notre livraison au Maroc après confirmation de l’adresse et du téléphone.`,
          },
          {
            q: "Le paiement à la livraison est-il disponible ?",
            a: "Oui — paiement à la livraison uniquement après confirmation. Pas de paiement carte obligatoire.",
          },
          {
            q: "Quel produit choisir en premier ?",
            a: "Amlou Royal : plusieurs formats, ingrédients naturels du Souss, livraison COD.",
          },
          {
            q: "WhatsApp ?",
            a: "Écrivez au +212 642 370 050 ou utilisez le bouton WhatsApp du site.",
          },
        ]}
      />
    );
  }

  if (locale === "en") {
    return (
      <GuideArticle
        path={path}
        crumbs={crumbs}
        secondaryHref={hubHref}
        secondaryLabel="Shop Amlou"
        label={`Amlou · ${name}`}
        title={`Amlou in ${name} — delivery & cash on delivery`}
        intro={`Looking for Amlou in ${name}? Tazarzit Bio delivers traditional Souss Amlou and Amlou Royal to your door in ${name} after phone confirmation, with cash on delivery.${touristNote} WhatsApp: +212 642 370 050.`}
        ctaHref={ctaHref}
        ctaLabel="Order Amlou Royal"
        sections={[
          {
            heading: `How to buy Amlou online in ${name}`,
            paragraphs: [
              `Pick a size on the Amlou or Amlou Royal page, enter your ${name} address, we confirm by phone, then ship. Cash on delivery — no prepaid card required.`,
              "Message WhatsApp for a quick order or questions about sizes.",
            ],
          },
          {
            heading: "Why Tazarzit Bio?",
            paragraphs: [
              "Natural Souss ingredients, creamy texture for breakfast and hosting, multiple sizes.",
              `Nationwide delivery including ${name} after address confirmation.`,
            ],
          },
        ]}
        faqs={[
          {
            q: `Do you deliver Amlou to ${name}?`,
            a: `Yes. ${name} is covered in our Morocco-wide delivery after confirming address and phone.`,
          },
          {
            q: "Is cash on delivery available?",
            a: "Yes — COD only after order confirmation. No prepaid card required.",
          },
          {
            q: "Best product to start with?",
            a: "Amlou Royal: multiple sizes, natural Souss ingredients, COD delivery.",
          },
          {
            q: "WhatsApp?",
            a: "Message +212 642 370 050 or use the site WhatsApp button.",
          },
        ]}
      />
    );
  }

  return (
    <GuideArticle
      path={path}
      crumbs={crumbs}
      secondaryHref={hubHref}
      secondaryLabel="تسوق الأملو"
      label={`أملو · ${name}`}
      title={`أملو في ${name} — توصيل والدفع عند الاستلام`}
      intro={`تبحث عن أملو في ${name}؟ تازارزيت بيو توصّل أملو تقليدي وأملو ملكي من سوس إلى باب منزلك في ${name}، مع تأكيد الطلب هاتفياً والدفع عند الاستلام.${touristNote} واتساب: +212 642 370 050.`}
      ctaHref={ctaHref}
      ctaLabel="اطلب أملو ملكي الآن"
      sections={[
        {
          heading: `كيف تشتري أملو أونلاين في ${name}؟`,
          paragraphs: [
            `اختر المنتج من صفحة الأملو أو أملو ملكي، أكمل الطلب بعنوانك في ${name}، ثم نؤكد معك بالهاتف قبل الشحن. الدفع عند الاستلام — بدون بطاقة مسبقة.`,
            "يمكنك أيضاً مراسلة واتساب مباشرة لطلب سريع أو استفسار عن الأحجام والتوفر.",
          ],
        },
        {
          heading: "لماذا أملو تازارزيت بيو؟",
          paragraphs: [
            "مكونات طبيعية من منطقة سوس، قوام كريمي مناسب للفطور والضيافة، وأحجام متعددة تناسب العائلة أو التجربة الأولى.",
            `التوصيل يغطي ${name} وباقي مدن المغرب عبر شركاء التوصيل بعد تأكيد العنوان.`,
          ],
        },
      ]}
      faqs={[
        {
          q: `هل توصلون الأملو إلى ${name}؟`,
          a: `نعم. نغطي ${name} ضمن التوصيل الوطني في المغرب بعد تأكيد العنوان ورقم الهاتف.`,
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
