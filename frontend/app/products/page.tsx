import type { Metadata } from "next";

import { ProductsCatalog } from "@/components/catalog/products-catalog";
import { Container, Section } from "@/components/layout/container";

export const metadata: Metadata = {
  title: "منتجاتنا",
  description:
    "تسوق أملو، زيت أركان، ومكسرات بالعسل من تازارزيت بيو — منتجات طبيعية فاخرة من سوس مع الدفع عند الاستلام.",
};

export default function ProductsPage() {
  return (
    <>
      <Section spacing="sm" className="border-b border-border/40 bg-hero-premium">
        <Container className="py-10 text-center md:py-14">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-accent">
            Tazarzit Bio
          </p>
          <h1 className="text-display mt-2 text-3xl text-foreground sm:text-4xl">
            متجر المنتجات الطبيعية
          </h1>
        </Container>
      </Section>
      <ProductsCatalog />
    </>
  );
}
