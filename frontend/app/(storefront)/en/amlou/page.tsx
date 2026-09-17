import type { Metadata } from "next";
import { AmlouHubPage } from "@/lib/seo/amlou-hub-page";
import { absoluteUrl } from "@/lib/seo/json-ld";

export const metadata: Metadata = {
  title: {
    absolute: "Buy natural Amlou online in Morocco | Tazarzit Bio",
  },
  description:
    "Traditional Amlou and Amlou Royal from Souss — 100% natural, nationwide delivery, cash on delivery from Tazarzit Bio.",
  alternates: {
    canonical: absoluteUrl("/en/amlou"),
    languages: {
      "ar-MA": absoluteUrl("/amlou"),
      "fr-MA": absoluteUrl("/fr/amlou"),
      "en-MA": absoluteUrl("/en/amlou"),
      "x-default": absoluteUrl("/amlou"),
    },
  },
  openGraph: {
    title: "Buy natural Amlou online | Tazarzit Bio",
    description:
      "Traditional Amlou and Amlou Royal from Souss with Moroccan delivery and cash on delivery.",
    url: absoluteUrl("/en/amlou"),
    locale: "en_MA",
  },
};

export default function Page() {
  return <AmlouHubPage locale="en" />;
}
