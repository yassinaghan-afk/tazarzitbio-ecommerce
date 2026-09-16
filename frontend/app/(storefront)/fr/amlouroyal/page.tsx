import type { Metadata } from "next";

import {
  LocalizedProductPage,
  localizedProductMetadata,
} from "@/lib/seo/localized-product-page";
import { AMLOU_ROYAL_SLUG } from "@/lib/products/amlou-royal";

export async function generateMetadata(): Promise<Metadata> {
  return localizedProductMetadata(AMLOU_ROYAL_SLUG, "fr");
}

export default async function FrAmlouRoyalPage() {
  return <LocalizedProductPage slug={AMLOU_ROYAL_SLUG} locale="fr" />;
}
