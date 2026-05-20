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

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <TrustBadges />
      <FamilyPackSection />
      <StorySection />
      <ProductShowcasesSection />
      <BestSellersSection />
      <ReviewSection />
      <IngredientsSection />
      <LifestyleSection />
      <FaqSection />
      <CtaSection />
    </>
  );
}
