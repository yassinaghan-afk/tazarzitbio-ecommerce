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
    "Authentic Moroccan products — 100% natural for tourists | Tazarzit Bio",
  description:
    "Traditional Moroccan foods for visitors: Amlou, edible argan oil, honey — no preservatives, no added sugar. Hotel/riad delivery and cash on delivery.",
  keywords: [
    "authentic Moroccan products",
    "traditional Moroccan food souvenirs",
    "natural amlou Morocco",
    "no added sugar Morocco",
    "buy Moroccan specialties tourists",
  ],
  alternates: {
    canonical: absoluteLocalizedUrl("en", TOURIST_HUB_PATH),
    languages: hreflangLanguages(TOURIST_HUB_PATH),
  },
  openGraph: {
    title: "Authentic Moroccan products — 100% natural",
    description:
      "Amlou, honey and food-grade argan oil without industrial additives — delivered during your Morocco trip.",
    url: absoluteLocalizedUrl("en", TOURIST_HUB_PATH),
    locale: "en_MA",
  },
};

export default async function Page() {
  const catalog = await getMergedCatalog();
  const listing = sortListingForHome(
    getListingProducts(catalog.map(toPublicProduct)),
  ).slice(0, 4);

  return <TouristProductsHub locale="en" products={listing} />;
}
