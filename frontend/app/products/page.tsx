import type { Metadata } from "next";

import { ProductsCatalog } from "@/components/catalog/products-catalog";
import { Container, Section } from "@/components/layout/container";

export const metadata: Metadata = {
  title: "منتجاتنا",
  description:
    "أملو، عسل، زيت أركان ومكسرات مختارة بعناية من سوس — جودة طبيعية، توصيل سريع، والدفع عند الاستلام.",
};

export default function ProductsPage() {
  return (
    <>
      <Section
        spacing="sm"
        className="border-b border-border/50 bg-hero-premium texture-grain"
      >
        <Container className="max-w-3xl py-8 text-center sm:py-10 md:py-11">
          <h1 className="text-display text-balance text-3xl font-extrabold leading-tight text-foreground sm:text-4xl lg:text-[2.35rem]">
            منتجات طبيعية فاخرة من قلب سوس
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-base leading-[1.85] text-muted-foreground sm:mt-5 sm:text-lg">
            أملو، عسل، زيت أركان ومكسرات مختارة بعناية — جودة طبيعية، توصيل
            سريع، والدفع عند الاستلام
          </p>
          <div
            aria-hidden
            className="mx-auto mt-6 h-[3px] w-20 rounded-full bg-gold-gradient shadow-gold sm:mt-7"
          />
        </Container>
      </Section>
      <ProductsCatalog />
    </>
  );
}
