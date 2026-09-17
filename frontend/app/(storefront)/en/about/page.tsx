import type { Metadata } from "next";

import { AboutPageContent } from "@/components/seo/about-page-content";
import { getAboutCopy } from "@/lib/seo/about-content";
import { hreflangLanguages } from "@/lib/seo/locale";

const copy = getAboutCopy("en");

export const metadata: Metadata = {
  title: { absolute: copy.title },
  description: copy.description,
  alternates: {
    canonical: "/en/about",
    languages: hreflangLanguages("/about"),
  },
  openGraph: {
    title: copy.h1,
    description: copy.lead,
    url: "/en/about",
    locale: "en_MA",
  },
};

export default function EnAboutPage() {
  return <AboutPageContent locale="en" />;
}
