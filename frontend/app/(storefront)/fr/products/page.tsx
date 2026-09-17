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
    absolute: "Acheter Amlou, miel et argan en ligne | Tazarzit Bio",
  },
  description:
    "Boutique Amlou, miel naturel et huile d'argan du Souss. Livraison partout au Maroc et paiement à la livraison — Tazarzit Bio.",
  keywords: [...MOROCCO_PRODUCT_KEYWORDS.fr],
  alternates: {
    canonical: "/fr/products",
    languages: hreflangLanguages("/products"),
  },
  openGraph: {
    title: "Acheter Amlou, miel et argan | Tazarzit Bio",
    description:
      "Amlou, miel et argan du Souss — livraison et paiement à la livraison au Maroc.",
    url: "/fr/products",
    locale: "fr_MA",
  },
};

export default function FrProductsPage() {
  return (
    <>
      <JsonLd data={faqPageJsonLd(getCatalogFaqs("fr"))} />
      <ProductsPageHero />
      <ProductsCatalog />
      <CatalogFaqSection />
    </>
  );
}
