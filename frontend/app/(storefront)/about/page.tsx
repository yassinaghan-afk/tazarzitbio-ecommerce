import type { Metadata } from "next";

import { AboutPageContent } from "@/components/seo/about-page-content";
import { getAboutCopy } from "@/lib/seo/about-content";
import { hreflangLanguages } from "@/lib/seo/locale";

const copy = getAboutCopy("ar");

export const metadata: Metadata = {
  title: { absolute: copy.title },
  description: copy.description,
  alternates: {
    canonical: "/about",
    languages: hreflangLanguages("/about"),
  },
  openGraph: {
    title: copy.h1,
    description: copy.lead,
    url: "/about",
    locale: "ar_MA",
  },
};

export default function AboutPage() {
  return <AboutPageContent locale="ar" />;
}
