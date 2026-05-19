import { BundleSection }   from "@/components/home/bundle-section";
import { CtaSection }      from "@/components/home/cta-section";
import { FaqSection }      from "@/components/home/faq-section";
import { HeroSection }     from "@/components/home/hero-section";
import { ProductsSection } from "@/components/home/products-section";
import { ReviewSection }   from "@/components/home/review-section";
import { StorySection }    from "@/components/home/story-section";
import { TrustBadges }     from "@/components/home/trust-badges";

export default function HomePage() {
  return (
    <>
      {/* 1 · Hero — above fold, animated product grid */}
      <HeroSection />

      {/* 2 · Trust strip — 5 trust signals */}
      <TrustBadges />

      {/* 3 · Product catalog — filterable grid */}
      <ProductsSection />

      {/* 4 · Bundles & gift boxes — AOV section */}
      <BundleSection />

      {/* 5 · Brand story — origin, values, stats */}
      <StorySection />

      {/* 6 · Social proof — reviews */}
      <ReviewSection />

      {/* 7 · FAQ accordion */}
      <FaqSection />

      {/* 8 · Final CTA — olive gradient */}
      <CtaSection />
    </>
  );
}
