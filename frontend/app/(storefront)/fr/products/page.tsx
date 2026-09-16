import type { Metadata } from "next";

import { ProductsCatalog } from "@/components/catalog/products-catalog";
import { ProductsPageHero } from "@/components/catalog/products-page-hero";
import {
  hreflangLanguages,
  MOROCCO_PRODUCT_KEYWORDS,
} from "@/lib/seo/locale";

export const metadata: Metadata = {
  title: "Nos produits | Amlou, miel, argan — Maroc",
  description:
    "Achetez Amlou, miel naturel, huile d'argan et fruits à coque du Souss. Livraison au Maroc et paiement à la livraison — Tazarzit Bio.",
  keywords: [...MOROCCO_PRODUCT_KEYWORDS.fr],
  alternates: {
    canonical: "/fr/products",
    languages: hreflangLanguages("/products"),
  },
  openGraph: {
    title: "Produits Tazarzit Bio",
    description:
      "Amlou, miel, argan — paiement à la livraison partout au Maroc.",
    url: "/fr/products",
    locale: "fr_MA",
  },
};

export default function FrProductsPage() {
  return (
    <>
      <ProductsPageHero />
      <ProductsCatalog />
    </>
  );
}
