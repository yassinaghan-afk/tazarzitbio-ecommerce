import type { Metadata } from "next";
import { AmlouHubPage } from "@/lib/seo/amlou-hub-page";
import { absoluteUrl } from "@/lib/seo/json-ld";

export const metadata: Metadata = {
  title: {
    absolute: "Acheter Amlou naturel en ligne au Maroc | Tazarzit Bio",
  },
  description:
    "Amlou traditionnel et Amlou Royal du Souss — 100% naturel, livraison nationale et paiement à la livraison chez Tazarzit Bio.",
  alternates: {
    canonical: absoluteUrl("/fr/amlou"),
    languages: {
      "ar-MA": absoluteUrl("/amlou"),
      "fr-MA": absoluteUrl("/fr/amlou"),
      "en-MA": absoluteUrl("/en/amlou"),
      "x-default": absoluteUrl("/amlou"),
    },
  },
  openGraph: {
    title: "Acheter Amlou naturel en ligne | Tazarzit Bio",
    description:
      "Amlou traditionnel et Amlou Royal du Souss, livraison au Maroc, paiement à la livraison.",
    url: absoluteUrl("/fr/amlou"),
    locale: "fr_MA",
  },
};

export default function Page() {
  return <AmlouHubPage locale="fr" />;
}
