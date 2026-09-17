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
  title: {
    absolute: "Our products | Amlou, honey, argan — Morocco | Tazarzit Bio",
  },
  description:
    "Shop Amlou, natural honey, argan oil and nuts from Souss. Morocco-wide delivery with cash on delivery — Tazarzit Bio.",
  keywords: [...MOROCCO_PRODUCT_KEYWORDS.en],
  alternates: {
    canonical: "/en/products",
    languages: hreflangLanguages("/products"),
  },
  openGraph: {
    title: "Tazarzit Bio products",
    description:
      "Amlou, honey, argan — cash on delivery across Morocco.",
    url: "/en/products",
    locale: "en_MA",
  },
};

export default function EnProductsPage() {
  return (
    <>
      <JsonLd data={faqPageJsonLd(getCatalogFaqs("en"))} />
      <ProductsPageHero />
      <ProductsCatalog />
      <CatalogFaqSection />
    </>
  );
}
