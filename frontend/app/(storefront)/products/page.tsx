import type { Metadata } from "next";

import { ProductsCatalog } from "@/components/catalog/products-catalog";
import { ProductsPageHero } from "@/components/catalog/products-page-hero";
import {
  hreflangLanguages,
  MOROCCO_PRODUCT_KEYWORDS,
} from "@/lib/seo/locale";

export const metadata: Metadata = {
  title: "منتجاتنا | أملو، عسل، أركان — المغرب",
  description:
    "تسوق أملو، عسل طبيعي، زيت أركان ومكسرات من سوس. توصيل داخل المغرب والدفع عند الاستلام من تازارزيت بيو.",
  keywords: [...MOROCCO_PRODUCT_KEYWORDS.ar],
  alternates: {
    canonical: "/products",
    languages: hreflangLanguages("/products"),
  },
  openGraph: {
    title: "منتجات تازارزيت بيو",
    description:
      "أملو، عسل، زيت أركان ومكسرات — الدفع عند الاستلام في المغرب.",
    url: "/products",
    locale: "ar_MA",
  },
};

export default function ProductsPage() {
  return (
    <>
      <ProductsPageHero />
      <ProductsCatalog />
    </>
  );
}
