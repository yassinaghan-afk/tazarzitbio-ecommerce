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
    "منتجات مغربية تقليدية 100٪ طبيعية للسيّاح | تازارزيت بيو",
  description:
    "هدايا ومأكولات مغربية أصيلة للسيّاح: أملو، أركان غذائي، عسل — بدون مواد حافظة وبدون سكر مضاف. توصيل للفندق والدفع عند الاستلام.",
  keywords: [
    "منتجات مغربية تقليدية",
    "هدايا من المغرب",
    "أملو طبيعي",
    "بدون سكر مضاف",
    "منتجات طبيعية المغرب",
    "authentic Moroccan products",
  ],
  alternates: {
    canonical: absoluteLocalizedUrl("ar", TOURIST_HUB_PATH),
    languages: hreflangLanguages(TOURIST_HUB_PATH),
  },
  openGraph: {
    title: "منتجات مغربية تقليدية 100٪ طبيعية — للسيّاح",
    description:
      "أملو وعسل وزيت أركان غذائي بدون إضافات صناعية — توصيل أثناء إقامتك في المغرب.",
    url: absoluteLocalizedUrl("ar", TOURIST_HUB_PATH),
    locale: "ar_MA",
  },
};

export default async function Page() {
  const catalog = await getMergedCatalog();
  const listing = sortListingForHome(
    getListingProducts(catalog.map(toPublicProduct)),
  ).slice(0, 4);

  return <TouristProductsHub locale="ar" products={listing} />;
}
