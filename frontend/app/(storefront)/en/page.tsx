import type { Metadata } from "next";

import HomePage from "@/app/(storefront)/page";
import {
  hreflangLanguages,
  MOROCCO_PRODUCT_KEYWORDS,
} from "@/lib/seo/locale";

export const metadata: Metadata = {
  title: {
    absolute: "Tazarzit Bio | Amlou, honey & argan — Morocco",
  },
  description:
    "Buy natural Souss Amlou, honey and argan oil online in Morocco. Nationwide delivery with cash on delivery.",
  keywords: [...MOROCCO_PRODUCT_KEYWORDS.en],
  alternates: {
    canonical: "/en",
    languages: hreflangLanguages("/"),
  },
  openGraph: {
    title: "Tazarzit Bio | Moroccan Amlou",
    description:
      "Natural Souss products — Amlou, honey, argan. Cash on delivery across Morocco.",
    url: "/en",
    locale: "en_MA",
  },
};

export default HomePage;
