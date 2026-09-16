import type { Metadata } from "next";

import { RoyalFrLandingPage } from "@/components/royal/royal-fr-landing-page";
import {
  AMLOU_ROYAL_FR_CANONICAL,
  AMLOU_ROYAL_FR_IMAGES,
  AMLOU_ROYAL_FR_NAME,
} from "@/lib/royal/fr-copy";

const TITLE = `${AMLOU_ROYAL_FR_NAME} | Tazarzit Bio`;
const DESCRIPTION =
  "Amlou Royal de Tazarzit Bio : mélange premium de fruits à coque sélectionnés et d'huile d'argan alimentaire. 100% naturel, sans sucre ajouté, paiement à la livraison au Maroc.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: {
    canonical: AMLOU_ROYAL_FR_CANONICAL,
  },
  openGraph: {
    type: "website",
    locale: "fr_MA",
    url: AMLOU_ROYAL_FR_CANONICAL,
    title: TITLE,
    description: DESCRIPTION,
    images: [
      {
        url: AMLOU_ROYAL_FR_IMAGES.hero.src,
        alt: AMLOU_ROYAL_FR_IMAGES.hero.alt,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: [AMLOU_ROYAL_FR_IMAGES.hero.src],
  },
};

export default function RoyalFrPage() {
  return <RoyalFrLandingPage />;
}

export const dynamic = "force-dynamic";
