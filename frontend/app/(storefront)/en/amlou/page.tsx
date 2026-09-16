import type { Metadata } from "next";

import { GuideArticle } from "@/components/seo/guide-article";
import {
  hreflangLanguages,
  MOROCCO_PRODUCT_KEYWORDS,
} from "@/lib/seo/locale";

export const metadata: Metadata = {
  title: "Buy Amlou in Morocco | Natural Amlou Online — Tazarzit Bio",
  description:
    "Order natural Souss Amlou in Morocco: almond Amlou and Amlou Royal. Nationwide delivery with cash on delivery from Tazarzit Bio.",
  keywords: [...MOROCCO_PRODUCT_KEYWORDS.en],
  alternates: {
    canonical: "/en/amlou",
    languages: hreflangLanguages("/amlou"),
  },
  openGraph: {
    title: "Amlou Morocco | Tazarzit Bio",
    description:
      "Authentic Souss Amlou — order online with cash on delivery across Morocco.",
    url: "/en/amlou",
    locale: "en_MA",
  },
};

export default function AmlouHubEnPage() {
  return (
    <GuideArticle
      path="/en/amlou"
      label="Amlou · Morocco"
      title="Natural Souss Amlou — buy online in Morocco"
      intro="Looking for Amlou? Tazarzit Bio offers traditional Amlou and Amlou Royal from the Souss region, with nationwide Moroccan delivery and cash on delivery."
      ctaHref="/en/amlouroyal"
      ctaLabel="Order Amlou Royal"
      sections={[
        {
          heading: "Why Tazarzit Bio?",
          paragraphs: [
            "Amlou is a classic Souss specialty. Our recipes focus on clear ingredients — almonds, nuts, argan oil, and honey depending on the recipe — without industrial preservatives.",
            "Order online, pick your size, then pay cash on delivery after phone confirmation.",
          ],
        },
        {
          heading: "Our Amlou range",
          paragraphs: [
            "Almond Amlou for everyday tables, and Amlou Royal as a premium nut and argan blend.",
            "Every product is built for the Moroccan market with city coverage through delivery partners.",
          ],
        },
      ]}
      faqs={[
        {
          q: "Where can I buy Amlou online in Morocco?",
          a: "On Tazarzit Bio — the Amlou Royal page or product catalog — with cash on delivery.",
        },
        {
          q: "Do you deliver to all cities?",
          a: "Yes. After confirming the address we ship across Morocco with our delivery partners.",
        },
      ]}
    />
  );
}
