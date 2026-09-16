import type { Metadata } from "next";
import { AmlouHubPage } from "@/lib/seo/amlou-hub-page";
import { absoluteUrl } from "@/lib/seo/json-ld";

export const metadata: Metadata = {
  title: "Amlou du Souss — acheter en ligne au Maroc | Tazarzit Bio",
  description:
    "Achetez Amlou traditionnel et Amlou Royal en ligne au Maroc. Ingrédients naturels du Souss, livraison nationale et paiement à la livraison.",
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
    title: "Amlou du Souss — Tazarzit Bio",
    description:
      "Amlou traditionnel et Amlou Royal du Souss, livraison au Maroc, paiement à la livraison.",
    url: absoluteUrl("/fr/amlou"),
    locale: "fr_MA",
  },
};

export default function Page() {
  return <AmlouHubPage locale="fr" />;
}
