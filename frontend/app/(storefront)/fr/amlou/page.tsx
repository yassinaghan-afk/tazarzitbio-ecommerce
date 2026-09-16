import type { Metadata } from "next";

import { GuideArticle } from "@/components/seo/guide-article";
import {
  hreflangLanguages,
  MOROCCO_PRODUCT_KEYWORDS,
} from "@/lib/seo/locale";

export const metadata: Metadata = {
  title: "Amlou Maroc | Acheter Amlou en ligne — Tazarzit Bio",
  description:
    "Achetez de l'Amlou naturel du Souss au Maroc : Amlou aux amandes et Amlou Royal. Livraison nationale et paiement à la livraison.",
  keywords: [...MOROCCO_PRODUCT_KEYWORDS.fr],
  alternates: {
    canonical: "/fr/amlou",
    languages: hreflangLanguages("/amlou"),
  },
  openGraph: {
    title: "Amlou Maroc | Tazarzit Bio",
    description:
      "Amlou authentique du Souss — commande en ligne, paiement à la livraison partout au Maroc.",
    url: "/fr/amlou",
    locale: "fr_MA",
  },
};

export default function AmlouHubFrPage() {
  return (
    <GuideArticle
      path="/fr/amlou"
      label="Amlou · Maroc"
      title="Amlou du Souss — acheter en ligne au Maroc"
      intro="Vous cherchez de l’Amlou ? Tazarzit Bio propose de l’Amlou traditionnel et l’Amlou Royal du Souss, en livraison partout au Maroc avec paiement à la livraison."
      ctaHref="/fr/amlouroyal"
      ctaLabel="Commander Amlou Royal"
      sections={[
        {
          heading: "Pourquoi Tazarzit Bio ?",
          paragraphs: [
            "L’Amlou est une spécialité du Souss. Nos recettes mettent en avant des ingrédients clairs — amandes, fruits à coque, huile d’argan, miel selon la formule — sans conservateurs industriels.",
            "Commandez en ligne, choisissez le format, puis payez en espèces à la livraison après confirmation téléphonique.",
          ],
        },
        {
          heading: "Nos Amlou",
          paragraphs: [
            "Amlou aux amandes pour le quotidien, Amlou Royal pour un mélange premium de fruits à coque et d’huile d’argan.",
            "Tous les produits sont pensés pour le marché marocain avec couverture des villes via nos partenaires de livraison.",
          ],
        },
      ]}
      faqs={[
        {
          q: "Où acheter de l’Amlou en ligne au Maroc ?",
          a: "Sur Tazarzit Bio — page Amlou Royal ou catalogue produits — avec paiement à la livraison.",
        },
        {
          q: "Livrez-vous dans toutes les villes ?",
          a: "Oui, après confirmation de l’adresse nous expédions via nos partenaires sur le territoire marocain.",
        },
      ]}
    />
  );
}
