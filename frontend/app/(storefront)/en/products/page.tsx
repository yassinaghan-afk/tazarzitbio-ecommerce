import type { Metadata } from "next";

import { ProductsCatalog } from "@/components/catalog/products-catalog";
import { ProductsPageHero } from "@/components/catalog/products-page-hero";
import {
  hreflangLanguages,
  MOROCCO_PRODUCT_KEYWORDS,
} from "@/lib/seo/locale";

export const metadata: Metadata = {
  title: "Our products | Amlou, honey, argan — Morocco",
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
      <ProductsPageHero />
      <ProductsCatalog />
    </>
  );
}
