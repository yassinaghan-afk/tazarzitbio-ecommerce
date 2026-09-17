import type { Metadata } from "next";

import { RoyalLandingPage } from "@/components/royal/royal-landing-page";
import {
  AMLOU_ROYAL_CANONICAL,
  AMLOU_ROYAL_IMAGE,
  AMLOU_ROYAL_SHOP_PATH,
  AMLOU_ROYAL_SLUG,
} from "@/lib/products/amlou-royal";
import { toPublicProduct } from "@/lib/products/catalog";
import { getMergedProductBySlug } from "@/lib/products/cms-catalog";
import { JsonLd, productJsonLd } from "@/lib/seo/json-ld";
import { localizedPath } from "@/lib/seo/locale";

const TITLE = "أملو ملكي | Tazarzit Bio";
const DESCRIPTION =
  "أملو ملكي من تازارزيت بيو: خليطة فاخرة من المكسرات المختارة وزيت أركان الغذائي والعسل الطبيعي. 100% طبيعي، بدون سكر مضاف، والدفع عند الاستلام في المغرب.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: {
    // Ads LP keeps its own URL; shop catalog canonical remains /amlouroyal
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

export default async function RoyalPage() {
  const product = await getMergedProductBySlug(AMLOU_ROYAL_SLUG);
  const publicProduct = product ? toPublicProduct(product) : null;
  const shopPath = localizedPath("ar", AMLOU_ROYAL_SHOP_PATH);

  return (
    <>
      {publicProduct ? (
        <JsonLd data={productJsonLd(publicProduct, shopPath, "ar")} />
      ) : null}
      <RoyalLandingPage />
    </>
  );
}

// Always serve latest checkout block during development / after deploys
export const dynamic = "force-dynamic";
