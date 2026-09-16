import type { Metadata } from "next";

import { TouristProductsHub } from "@/components/seo/tourist-products-hub";
import { toPublicProduct } from "@/lib/products/catalog";
import { getMergedCatalog } from "@/lib/products/cms-catalog";
import { getListingProducts, sortListingForHome } from "@/lib/products/listing";
import {
  absoluteLocalizedUrl,
  hreflangLanguages,
} from "@/lib/seo/locale";
import { TOURIST_HUB_PATH } from "@/lib/seo/tourist-hub";

export const metadata: Metadata = {
  title:
    "Produits marocains traditionnels 100 % naturels | Tazarzit Bio",
  description:
    "Spécialités marocaines authentiques pour voyageurs : Amlou, argan alimentaire, miel — sans conservateurs ni sucre ajouté. Livraison hôtel/riad, paiement à la livraison.",
  keywords: [
    "produits marocains authentiques",
    "souvenirs comestibles maroc",
    "amlou naturel",
    "sans sucre ajouté",
    "produits bio maroc touristes",
  ],
  alternates: {
    canonical: absoluteLocalizedUrl("fr", TOURIST_HUB_PATH),
    languages: hreflangLanguages(TOURIST_HUB_PATH),
  },
  openGraph: {
    title: "Produits marocains traditionnels 100 % naturels",
    description:
      "Amlou, miel et argan alimentaire sans additifs — livraison pendant votre séjour au Maroc.",
    url: absoluteLocalizedUrl("fr", TOURIST_HUB_PATH),
    locale: "fr_MA",
  },
};

export default async function Page() {
  const catalog = await getMergedCatalog();
  const listing = sortListingForHome(
    getListingProducts(catalog.map(toPublicProduct)),
  ).slice(0, 4);

  return <TouristProductsHub locale="fr" products={listing} />;
}
