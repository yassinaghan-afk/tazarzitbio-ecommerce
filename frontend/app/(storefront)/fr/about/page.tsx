import type { Metadata } from "next";

import { AboutPageContent } from "@/components/seo/about-page-content";
import { getAboutCopy } from "@/lib/seo/about-content";
import { hreflangLanguages } from "@/lib/seo/locale";

const copy = getAboutCopy("fr");

export const metadata: Metadata = {
  title: { absolute: copy.title },
  description: copy.description,
  alternates: {
    canonical: "/fr/about",
    languages: hreflangLanguages("/about"),
  },
  openGraph: {
    title: copy.h1,
    description: copy.lead,
    url: "/fr/about",
    locale: "fr_MA",
  },
};

export default function FrAboutPage() {
  return <AboutPageContent locale="fr" />;
}
