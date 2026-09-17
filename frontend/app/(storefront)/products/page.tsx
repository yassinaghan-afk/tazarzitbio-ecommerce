import type { Metadata } from "next";

import { CatalogFaqSection } from "@/components/catalog/catalog-faq-section";
import { ProductsCatalog } from "@/components/catalog/products-catalog";
import { ProductsPageHero } from "@/components/catalog/products-page-hero";
import { getCatalogFaqs } from "@/lib/seo/default-faqs";
import { faqPageJsonLd, JsonLd } from "@/lib/seo/json-ld";
import {
  hreflangLanguages,
  MOROCCO_PRODUCT_KEYWORDS,
} from "@/lib/seo/locale";

export const metadata: Metadata = {
  title: { absolute: "منتجاتنا | أملو، عسل، أركان — المغرب | تازارزيت بيو" },
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
      <JsonLd data={faqPageJsonLd(getCatalogFaqs("ar"))} />
      <ProductsPageHero />
      <ProductsCatalog />
      <CatalogFaqSection />
    </>
  );
}
