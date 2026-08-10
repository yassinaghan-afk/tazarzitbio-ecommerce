import type { ReactNode } from "react";

import { BestSellersSection } from "@/components/home/best-sellers-section";
import { ProductShowcasesSection } from "@/components/home/product-showcases-section";
import { CtaSection } from "@/components/home/cta-section";
import { FamilyPackSection } from "@/components/home/family-pack-section";
import { FaqSection } from "@/components/home/faq-section";
import { HeroSection } from "@/components/home/hero-section";
import { IngredientsSection } from "@/components/home/ingredients-section";
import { LifestyleSection } from "@/components/home/lifestyle-section";
import { ReviewSection } from "@/components/home/review-section";
import { StorySection } from "@/components/home/story-section";
import { TrustBadges } from "@/components/home/trust-badges";
import type { HomeSectionId } from "@/lib/admin/cms-types";
import { readStore } from "@/lib/server/store";

export default async function HomePage() {
  const store = await readStore();

  // CMS content: approved global reviews & active global FAQs (empty = defaults)
  const cmsReviews = store.reviews.filter((r) => r.isApproved && !r.productSlug);
  const cmsFaqs = store.faqs
    .filter((f) => f.isActive && !f.productSlug)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const sections: Record<HomeSectionId, ReactNode> = {
    hero: <HeroSection />,
    "trust-badges": <TrustBadges />,
    "family-pack": <FamilyPackSection />,
    story: <StorySection />,
    showcases: <ProductShowcasesSection />,
    "best-sellers": <BestSellersSection />,
    reviews: <ReviewSection cmsReviews={cmsReviews} />,
    ingredients: <IngredientsSection />,
    lifestyle: <LifestyleSection />,
    faq: <FaqSection cmsFaqs={cmsFaqs} />,
    cta: <CtaSection />,
  };

  return (
    <>
      {store.homeSections
        .filter((s) => s.isVisible)
        .map((s) => (
          <div key={s.id}>{sections[s.id]}</div>
        ))}
    </>
  );
}
