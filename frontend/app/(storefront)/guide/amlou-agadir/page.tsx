import type { Metadata } from "next";

import {
  AmlouCityGuidePage,
  getAmlouCityMeta,
} from "@/lib/seo/amlou-city-page";

const meta = getAmlouCityMeta("agadir");

export const metadata: Metadata = {
  title: meta.title,
  description: meta.description,
  keywords: meta.keywords,
  alternates: { canonical: meta.path },
  openGraph: {
    title: meta.ogTitle,
    description: meta.ogDescription,
    url: meta.path,
  },
};

export default function Page() {
  return <AmlouCityGuidePage city="agadir" />;
}
