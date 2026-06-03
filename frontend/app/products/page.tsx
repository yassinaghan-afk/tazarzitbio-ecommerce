import type { Metadata } from "next";

import { ProductsCatalog } from "@/components/catalog/products-catalog";
import { ProductsPageHero } from "@/components/catalog/products-page-hero";

export const metadata: Metadata = {
  title: "منتجاتنا",
  description:
    "أملو، عسل، زيت أركان ومكسرات مختارة بعناية من سوس — جودة طبيعية، توصيل سريع، والدفع عند الاستلام.",
};

export default function ProductsPage() {
  return (
    <>
      <ProductsPageHero />
      <ProductsCatalog />
    </>
  );
}
