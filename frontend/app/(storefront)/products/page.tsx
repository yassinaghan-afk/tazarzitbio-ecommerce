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
  title: { absolute: "شراء أملو وعسل وزيت أركان أونلاين | تازارزيت بيو" },
  description:
    "تسوق أملو طبيعي، عسل، وزيت أركان من سوس. توصيل لكل مدن المغرب والدفع عند الاستلام — تازارزيت بيو.",
  keywords: [...MOROCCO_PRODUCT_KEYWORDS.ar],
  alternates: {
    canonical: "/products",
    languages: hreflangLanguages("/products"),
  },
  openGraph: {
    title: "شراء أملو وعسل وزيت أركان | تازارزيت بيو",
    description:
      "أملو، عسل، وزيت أركان من سوس — توصيل والدفع عند الاستلام في المغرب.",
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
