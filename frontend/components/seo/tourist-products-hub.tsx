"use client";

import Link from "next/link";

import { CatalogProductCard } from "@/components/catalog/catalog-product-card";
import { Container, Section } from "@/components/layout/container";
import { DeliveryCitiesBlock } from "@/components/product/delivery-cities-block";
import type { Language } from "@/lib/i18n/types";
import type { PublicProduct } from "@/lib/products/types";
import {
  AMLOU_CITIES,
  amlouCityPath,
} from "@/lib/seo/amlou-cities";
import {
  breadcrumbJsonLd,
  faqPageJsonLd,
  JsonLd,
} from "@/lib/seo/json-ld";
import { localizedPath } from "@/lib/seo/locale";
import { TOURIST_HUB_PATH } from "@/lib/seo/tourist-hub";

export { TOURIST_HUB_PATH } from "@/lib/seo/tourist-hub";

const TOURIST_CITY_SLUGS = [
  "marrakech",
  "agadir",
  "taghazout",
  "essaouira",
  "chefchaouen",
  "fes",
  "ouarzazate",
  "merzouga",
  "imsouane",
  "tamraght",
  "asilah",
  "ifrane",
] as const;

type Copy = {
  label: string;
  title: string;
  intro: string;
  promiseTitle: string;
  promises: { title: string; text: string }[];
  whoTitle: string;
  whoText: string;
  productsTitle: string;
  productsDesc: string;
  citiesTitle: string;
  citiesDesc: string;
  ctaLabel: string;
  shopLabel: string;
  waLabel: string;
  sections: { heading: string; paragraphs: string[] }[];
  faqs: { q: string; a: string }[];
  home: string;
};

const COPY: Record<Language, Copy> = {
  ar: {
    label: "سيّاح المغرب · منتجات تقليدية",
    title: "منتجات مغربية تقليدية 100٪ طبيعية — للسيّاح والزوار",
    intro:
      "تبحث عن هدايا ومأكولات مغربية أصيلة أثناء زيارتك للمغرب؟ تازارزيت بيو تقدّم أملو، زيت أركان غذائي، وعسل طبيعي من سوس — بدون مواد حافظة صناعية وبدون سكر مضاف، مع التوصيل إلى فندقك أو إقامتك والدفع عند الاستلام.",
    promiseTitle: "وعدنا للسيّاح",
    promises: [
      {
        title: "100٪ طبيعي",
        text: "مكونات تقليدية واضحة من سوس — بدون إضافات صناعية.",
      },
      {
        title: "بدون سكر مضاف",
        text: "الحلاوة عند وجودها تأتي من العسل الطبيعي فقط، لا سكر مكرّر.",
      },
      {
        title: "بدون مواد حافظة",
        text: "وصفات تقليدية تُحضَّر بعناية للنظافة والجودة، دون مواد حافظة صناعية.",
      },
      {
        title: "توصيل للسيّاح",
        text: "توصيل للفنادق والرياض والمدن السياحية — واتساب +212 642 370 050.",
      },
    ],
    whoTitle: "لمن هذه الصفحة؟",
    whoText:
      "للسيّاح الأجانب والمغاربة المقيمين بالخارج والزوار الباحثين عن منتجات مغربية تقليدية حقيقية يأخذونها هدية أو يستمتعون بها أثناء الإقامة — وليس عن منتجات مصنّعة مليئة بالمواد المضافة.",
    productsTitle: "منتجات تقليدية مقترحة",
    productsDesc: "ابدأ بأملو ملكي أو تصفّح منتجاتنا الطبيعية.",
    citiesTitle: "نوصل للوجهات السياحية",
    citiesDesc: "صفحات توصيل مخصّصة لأشهر المدن والوجهات.",
    ctaLabel: "اطلب أملو ملكي",
    shopLabel: "كل المنتجات",
    waLabel: "واتساب للسيّاح",
    sections: [
      {
        heading: "لماذا يبحث السيّاح عن منتجات طبيعية في المغرب؟",
        paragraphs: [
          "كثير من الزوار يريدون تذوق المطبخ المغربي التقليدي بعيداً عن النسخ الصناعية: أملو من سوس، زيت أركان غذائي، وعسل نقي. يهمّهم أن تكون الوصفة أصيلة والمكونات شفافة.",
          "تازارزيت بيو تركّز على هذا الطلب: منتجات تقليدية، طبيعية، بدون سكر مضاف وبدون مواد حافظة صناعية، مع طلب سهل عبر الموقع أو واتساب.",
        ],
      },
      {
        heading: "كيف تطلب وأنت سائح في المغرب؟",
        paragraphs: [
          "اختر المنتج، أدخل عنوان الفندق أو الرياض أو الشقة، نؤكد الطلب هاتفياً أو عبر واتساب، ثم التوصيل والدفع عند الاستلام.",
          "مناسب إن كنت في مراكش، أكادير، تغازوت، الصويرة، فاس، شفشاون أو وجهات أخرى — نغطي المدن السياحية ضمن التوصيل الوطني.",
        ],
      },
    ],
    faqs: [
      {
        q: "هل المنتجات 100٪ طبيعية وبدون مواد مضافة؟",
        a: "نعم — نركز على مكونات طبيعية تقليدية دون مواد حافظة صناعية ودون سكر مضاف. تفاصيل كل منتج واضحة على صفحته.",
      },
      {
        q: "هل يمكن التوصيل للفندق أثناء السياحة؟",
        a: "نعم. اذكر اسم الفندق/الرياض والمدينة ورقم الغرفة إن وُجد. نؤكد العنوان قبل الشحن والدفع عند الاستلام.",
      },
      {
        q: "هل أملو مناسب كهدية من المغرب؟",
        a: "نعم — أملو ملكي منتج تقليدي فاخر من سوس، كثير من السيّاح يطلبونه هدية أو للاستمتاع أثناء الإقامة.",
      },
      {
        q: "كيف أتواصل بالإنجليزية أو الفرنسية؟",
        a: "راسل واتساب +212 642 370 050 أو تصفّح الصفحات بالفرنسية والإنجليزية على الموقع.",
      },
    ],
    home: "الرئيسية",
  },
  fr: {
    label: "Touristes au Maroc · produits traditionnels",
    title: "Produits marocains traditionnels 100 % naturels — pour visiteurs",
    intro:
      "Vous cherchez des spécialités marocaines authentiques pendant votre séjour ? Tazarzit Bio propose Amlou, huile d’argan alimentaire et miels naturels du Souss — sans conservateurs industriels ni sucre ajouté, avec livraison à votre hôtel/riad et paiement à la livraison.",
    promiseTitle: "Notre promesse aux voyageurs",
    promises: [
      {
        title: "100 % naturel",
        text: "Ingrédients traditionnels clairs du Souss — sans additifs industriels.",
      },
      {
        title: "Sans sucre ajouté",
        text: "La douceur vient uniquement du miel naturel lorsqu’il est utilisé — pas de sucre raffiné.",
      },
      {
        title: "Sans conservateurs",
        text: "Recettes traditionnelles préparées avec soin pour l’hygiène et la qualité, sans conservateurs industriels.",
      },
      {
        title: "Livraison touristes",
        text: "Hôtels, riads et villes touristiques — WhatsApp +212 642 370 050.",
      },
    ],
    whoTitle: "Pour qui ?",
    whoText:
      "Pour les voyageurs, expatriés de passage et visiteurs qui veulent de vrais produits marocains traditionnels — pas des versions industrielles remplies d’additifs.",
    productsTitle: "Produits traditionnels recommandés",
    productsDesc: "Commencez par l’Amlou Royal ou parcourez nos produits naturels.",
    citiesTitle: "Livraison dans les destinations touristiques",
    citiesDesc: "Pages dédiées aux villes et spots les plus visités.",
    ctaLabel: "Commander Amlou Royal",
    shopLabel: "Tous les produits",
    waLabel: "WhatsApp voyageurs",
    sections: [
      {
        heading: "Pourquoi les touristes cherchent des produits naturels au Maroc",
        paragraphs: [
          "Beaucoup de visiteurs veulent goûter le Maroc traditionnel : Amlou du Souss, argan alimentaire, miel pur — avec une composition transparente.",
          "Tazarzit Bio répond à cette intention : produits traditionnels, naturels, sans sucre ajouté ni conservateurs industriels, commande simple sur le site ou WhatsApp.",
        ],
      },
      {
        heading: "Comment commander pendant votre séjour",
        paragraphs: [
          "Choisissez le produit, indiquez l’adresse de l’hôtel/riad, nous confirmons par téléphone ou WhatsApp, puis livraison et paiement à la livraison.",
          "Idéal à Marrakech, Agadir, Taghazout, Essaouira, Fès, Chefchaouen et d’autres destinations couvertes par la livraison nationale.",
        ],
      },
    ],
    faqs: [
      {
        q: "Les produits sont-ils 100 % naturels, sans additifs ?",
        a: "Oui — ingrédients naturels traditionnels, sans conservateurs industriels ni sucre ajouté. Chaque fiche produit détaille la composition.",
      },
      {
        q: "Livrez-vous à l’hôtel ?",
        a: "Oui. Indiquez le nom de l’hôtel/riad, la ville et le numéro de chambre si besoin. Confirmation avant expédition, paiement à la livraison.",
      },
      {
        q: "L’Amlou est-il un bon souvenir comestible ?",
        a: "Oui — l’Amlou Royal est une spécialité du Souss très appréciée comme cadeau ou pour le petit-déjeuner sur place.",
      },
      {
        q: "Puis-je écrire en anglais ou français ?",
        a: "Oui — WhatsApp +212 642 370 050, et le site est disponible en FR et EN.",
      },
    ],
    home: "Accueil",
  },
  en: {
    label: "Morocco tourists · traditional products",
    title: "Authentic Moroccan products — 100% natural for visitors",
    intro:
      "Looking for real traditional Moroccan foods while visiting Morocco? Tazarzit Bio offers Amlou, food-grade argan oil and natural honeys from Souss — no industrial preservatives, no added sugar — with delivery to your hotel/riad and cash on delivery.",
    promiseTitle: "Our promise to travelers",
    promises: [
      {
        title: "100% natural",
        text: "Clear traditional Souss ingredients — no industrial additives.",
      },
      {
        title: "No added sugar",
        text: "Sweetness comes only from natural honey when used — never refined sugar.",
      },
      {
        title: "No preservatives",
        text: "Traditional recipes prepared with care for hygiene and quality, without industrial preservatives.",
      },
      {
        title: "Tourist delivery",
        text: "Hotels, riads and tourist towns — WhatsApp +212 642 370 050.",
      },
    ],
    whoTitle: "Who is this for?",
    whoText:
      "Travelers, visiting diaspora and guests who want genuine traditional Moroccan products — not industrial versions full of additives.",
    productsTitle: "Recommended traditional products",
    productsDesc: "Start with Amlou Royal or browse our natural range.",
    citiesTitle: "We deliver to tourist destinations",
    citiesDesc: "Dedicated pages for popular cities and spots.",
    ctaLabel: "Order Amlou Royal",
    shopLabel: "All products",
    waLabel: "WhatsApp for travelers",
    sections: [
      {
        heading: "Why tourists search for natural Moroccan products",
        paragraphs: [
          "Many visitors want authentic Souss Amlou, edible argan oil and pure honey — with transparent ingredients, not factory blends.",
          "Tazarzit Bio is built for that intent: traditional, natural products without added sugar or industrial preservatives, easy to order online or on WhatsApp.",
        ],
      },
      {
        heading: "How to order during your stay",
        paragraphs: [
          "Pick a product, enter your hotel/riad address, we confirm by phone or WhatsApp, then deliver with cash on delivery.",
          "Works well in Marrakech, Agadir, Taghazout, Essaouira, Fez, Chefchaouen and other destinations covered nationwide.",
        ],
      },
    ],
    faqs: [
      {
        q: "Are products 100% natural with no additives?",
        a: "Yes — traditional natural ingredients, no industrial preservatives and no added sugar. Each product page lists details clearly.",
      },
      {
        q: "Can you deliver to my hotel?",
        a: "Yes. Share hotel/riad name, city and room number if needed. We confirm before shipping; pay cash on delivery.",
      },
      {
        q: "Is Amlou a good edible souvenir from Morocco?",
        a: "Yes — Amlou Royal is a premium Souss specialty popular as a gift or for breakfast during your stay.",
      },
      {
        q: "Can I message in English or French?",
        a: "Yes — WhatsApp +212 642 370 050, and the site is available in FR and EN.",
      },
    ],
    home: "Home",
  },
};

export function TouristProductsHub({
  locale,
  products,
}: {
  locale: Language;
  products: PublicProduct[];
}) {
  const copy = COPY[locale];
  const path = localizedPath(locale, TOURIST_HUB_PATH);
  const waHref = `https://wa.me/212642370050?text=${encodeURIComponent(
    locale === "fr"
      ? "Bonjour, je suis en voyage au Maroc et je souhaite des produits naturels traditionnels (sans sucre ajouté)."
      : locale === "en"
        ? "Hello, I'm visiting Morocco and I'd like traditional 100% natural products (no added sugar)."
        : "السلام، أنا سائح في المغرب وبغيت منتجات تقليدية طبيعية 100٪ بدون سكر مضاف.",
  )}`;

  const touristCities = TOURIST_CITY_SLUGS.map((slug) =>
    AMLOU_CITIES.find((c) => c.slug === slug),
  ).filter(Boolean);

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: copy.home, path: localizedPath(locale, "/") },
          { name: copy.title, path },
        ])}
      />
      <JsonLd data={faqPageJsonLd(copy.faqs)} />

      <Section spacing="lg" className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_hsl(35_65%_46%_/_0.14),_transparent_55%),radial-gradient(ellipse_at_bottom,_hsl(96_33%_22%_/_0.1),_transparent_50%)]"
        />
        <Container size="md" className="relative">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-accent">
            {copy.label}
          </p>
          <h1 className="mt-4 text-3xl font-extrabold leading-tight text-foreground sm:text-4xl">
            {copy.title}
          </h1>
          <p className="mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg">
            {copy.intro}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={localizedPath(locale, "/amlouroyal")}
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              {copy.ctaLabel}
            </Link>
            <Link
              href={localizedPath(locale, "/products")}
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-border px-5 text-sm font-semibold text-foreground transition-colors hover:border-accent hover:text-accent"
            >
              {copy.shopLabel}
            </Link>
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#25D366] px-5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              {copy.waLabel}
            </a>
          </div>

          <div className="mt-14">
            <h2 className="text-xl font-bold text-foreground sm:text-2xl">
              {copy.promiseTitle}
            </h2>
            <ul className="mt-6 grid gap-4 sm:grid-cols-2">
              {copy.promises.map((p) => (
                <li
                  key={p.title}
                  className="border-b border-border/70 pb-4 last:border-b-0 sm:border-b-0 sm:pb-0"
                >
                  <p className="font-semibold text-foreground">{p.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {p.text}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-14">
            <h2 className="text-xl font-bold text-foreground sm:text-2xl">
              {copy.whoTitle}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-foreground/80 sm:text-base">
              {copy.whoText}
            </p>
          </div>

          {products.length > 0 ? (
            <div className="mt-14">
              <h2 className="text-xl font-bold text-foreground sm:text-2xl">
                {copy.productsTitle}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {copy.productsDesc}
              </p>
              <div className="mt-8 grid gap-6 sm:grid-cols-2">
                {products.map((p) => (
                  <CatalogProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          ) : null}

          <div className="mt-14 space-y-10">
            {copy.sections.map((section) => (
              <section key={section.heading}>
                <h2 className="text-xl font-bold text-foreground sm:text-2xl">
                  {section.heading}
                </h2>
                <div className="mt-4 space-y-4 text-sm leading-relaxed text-foreground/80 sm:text-base">
                  {section.paragraphs.map((para) => (
                    <p key={para.slice(0, 48)}>{para}</p>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <div className="mt-14">
            <h2 className="text-xl font-bold text-foreground sm:text-2xl">
              {copy.citiesTitle}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {copy.citiesDesc}
            </p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {touristCities.map((city) => {
                if (!city) return null;
                const label =
                  locale === "fr"
                    ? city.nameFr
                    : locale === "en"
                      ? city.nameEn
                      : city.nameAr;
                return (
                  <li key={city.slug}>
                    <Link
                      href={localizedPath(locale, amlouCityPath(city.slug))}
                      className="inline-flex rounded-full border border-accent/30 bg-accent/10 px-3 py-1.5 text-xs font-semibold text-accent-foreground transition-colors hover:border-accent"
                    >
                      {label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          <DeliveryCitiesBlock className="mt-14" />

          <section className="mt-14">
            <h2 className="text-xl font-bold text-foreground sm:text-2xl">
              {locale === "fr"
                ? "FAQ voyageurs"
                : locale === "en"
                  ? "Traveler FAQ"
                  : "أسئلة السيّاح"}
            </h2>
            <div className="mt-6 space-y-4">
              {copy.faqs.map((faq) => (
                <div
                  key={faq.q}
                  className="border-b border-border/70 pb-4 last:border-b-0"
                >
                  <h3 className="text-base font-semibold text-foreground">
                    {faq.q}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </Container>
      </Section>
    </>
  );
}
