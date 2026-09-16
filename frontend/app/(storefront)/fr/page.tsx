import type { Metadata } from "next";

import HomePage from "@/app/(storefront)/page";
import {
  hreflangLanguages,
  MOROCCO_PRODUCT_KEYWORDS,
} from "@/lib/seo/locale";

export const metadata: Metadata = {
  title: {
    absolute: "Tazarzit Bio | Amlou, miel et argan — Maroc",
  },
  description:
    "Achetez Amlou, miel naturel et huile d'argan du Souss en ligne au Maroc. Livraison nationale et paiement à la livraison.",
  keywords: [...MOROCCO_PRODUCT_KEYWORDS.fr],
  alternates: {
    canonical: "/fr",
    languages: hreflangLanguages("/"),
  },
  openGraph: {
    title: "Tazarzit Bio | Amlou du Maroc",
    description:
      "Produits naturels du Souss — Amlou, miel, argan. Paiement à la livraison.",
    url: "/fr",
    locale: "fr_MA",
  },
};

export default HomePage;
