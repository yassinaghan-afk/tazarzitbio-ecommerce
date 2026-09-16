import type { Metadata } from "next";

import { RoyalFrThankYouClient } from "@/components/royal/royal-fr-thank-you-client";
import { AMLOU_ROYAL_FR_CANONICAL } from "@/lib/royal/fr-copy";

export const metadata: Metadata = {
  title: { absolute: "Merci pour votre commande | Amlou Royal" },
  description:
    "Nous avons bien reçu votre commande. Nous vous appellerons bientôt pour la confirmer.",
  robots: { index: false, follow: false },
  alternates: {
    canonical: `${AMLOU_ROYAL_FR_CANONICAL}/thank-you`,
  },
};

export default function RoyalFrThankYouPage() {
  return <RoyalFrThankYouClient />;
}

export const dynamic = "force-dynamic";
