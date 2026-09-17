import type { Metadata } from "next";
import type { ReactNode } from "react";

import { BestSellersSection } from "@/components/home/best-sellers-section";
import { HomeProductsSection } from "@/components/home/home-products-section";
import { ProductShowcasesSection } from "@/components/home/product-showcases-section";
import { CtaSection } from "@/components/home/cta-section";
import { FaqSection } from "@/components/home/faq-section";
import { HeroSection } from "@/components/home/hero-section";
import { IngredientsSection } from "@/components/home/ingredients-section";
import { LifestyleSection } from "@/components/home/lifestyle-section";
import { ReviewSection } from "@/components/home/review-section";
import { StorySection } from "@/components/home/story-section";
import { TrustBadges } from "@/components/home/trust-badges";
import type { HomeSectionId } from "@/lib/admin/cms-types";
import { getDefaultHomeFaqs } from "@/lib/seo/default-faqs";
import { faqPageJsonLd, JsonLd } from "@/lib/seo/json-ld";
import {
  hreflangLanguages,
  MOROCCO_PRODUCT_KEYWORDS,
} from "@/lib/seo/locale";
import { getRequestLocale } from "@/lib/seo/request-locale";
import { readStore } from "@/lib/server/store";

export async function generateMetadata(): Promise<Metadata> {
  const store = await readStore();
  const settings = store.siteSettings;
  const title =
    settings.seoTitle?.trim() ||
    "تازارزيت بيو | أملو وعسل وزيت أركان — المغرب";
  const description =
    settings.seoDescription?.trim() ||
    "اشترِ أملو، عسل طبيعي، وزيت أركان من سوس أونلاين في المغرب. توصيل لكل المدن والدفع عند الاستلام — تازارزيت بيو.";
  const ogImage = settings.ogImage?.trim() || "/brand/tazarzitbio-logo.png";

  return {
    title: { absolute: title },
    description,
    keywords: [...MOROCCO_PRODUCT_KEYWORDS.ar],
    alternates: {
      canonical: "/",
      languages: hreflangLanguages("/"),
    },
    openGraph: {
      title,
      description,
      url: "/",
      locale: "ar_MA",
      images: [{ url: ogImage, alt: settings.brandName || "تازارزيت بيو" }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function HomePage() {
  const store = await readStore();
  const locale = await getRequestLocale();

  const cmsReviews = store.reviews.filter((r) => r.isApproved && !r.productSlug);
  const cmsFaqs = store.faqs
    .filter((f) => f.isActive && !f.productSlug)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const faqSchemaItems =
    cmsFaqs.length > 0
      ? cmsFaqs.map((f) => ({
          q:
            (locale === "fr" || locale === "en") && f.questionFr
              ? f.questionFr
              : f.questionAr,
          a:
            (locale === "fr" || locale === "en") && f.answerFr
              ? f.answerFr
              : f.answerAr,
        }))
      : getDefaultHomeFaqs(locale);

  const sections: Record<HomeSectionId, ReactNode> = {
    hero: <HeroSection />,
    "trust-badges": <TrustBadges />,
    story: <StorySection />,
    showcases: <ProductShowcasesSection />,
    "best-sellers": <BestSellersSection />,
    "discover-products": <HomeProductsSection />,
    reviews: <ReviewSection cmsReviews={cmsReviews} />,
    ingredients: <IngredientsSection />,
    lifestyle: <LifestyleSection />,
    faq: (
      <FaqSection
        cmsFaqs={cmsFaqs}
        whatsappDigits={store.siteSettings.whatsapp}
      />
    ),
    cta: <CtaSection />,
  };

  return (
    <>
      <JsonLd data={faqPageJsonLd(faqSchemaItems)} />
      {store.homeSections
        .filter((s) => s.isVisible)
        .map((s) => (
          <div key={s.id}>{sections[s.id]}</div>
        ))}
    </>
  );
}
