import { ApiStatus } from "@/components/home/api-status";
import { HeroSection } from "@/components/home/hero-section";
import { ProductsSection } from "@/components/home/products-section";
import { StorySection } from "@/components/home/story-section";
import { TrustSection } from "@/components/home/trust-section";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <TrustSection />
      <ProductsSection />
      <StorySection />
      <section className="py-8">
        <ApiStatus />
      </section>
    </>
  );
}
