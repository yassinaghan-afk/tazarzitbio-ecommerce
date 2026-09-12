import type { Metadata } from "next";

import { RoyalLandingPage } from "@/components/royal/royal-landing-page";
import {
  AMLOU_ROYAL_CANONICAL,
  AMLOU_ROYAL_IMAGE,
} from "@/lib/products/amlou-royal";

const TITLE = "أملو ملكي | Tazarzit Bio";
const DESCRIPTION =
  "أملو ملكي من تازارزيت بيو: خليطة فاخرة من المكسرات المختارة وزيت أركان الغذائي والعسل الطبيعي. 100% طبيعي، بدون سكر مضاف، والدفع عند الاستلام في المغرب.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: {
    canonical: AMLOU_ROYAL_CANONICAL,
  },
  openGraph: {
    type: "website",
    locale: "ar_MA",
    url: AMLOU_ROYAL_CANONICAL,
    title: TITLE,
    description: DESCRIPTION,
    images: [{ url: AMLOU_ROYAL_IMAGE, alt: "أملو ملكي تازارزيت بيو" }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: [AMLOU_ROYAL_IMAGE],
  },
};

export default function RoyalPage() {
  return <RoyalLandingPage />;
}

// Always serve latest checkout block during development / after deploys
export const dynamic = "force-dynamic";
