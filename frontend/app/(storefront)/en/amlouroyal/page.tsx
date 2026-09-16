import type { Metadata } from "next";

import {
  LocalizedProductPage,
  localizedProductMetadata,
} from "@/lib/seo/localized-product-page";
import { AMLOU_ROYAL_SLUG } from "@/lib/products/amlou-royal";

export async function generateMetadata(): Promise<Metadata> {
  return localizedProductMetadata(AMLOU_ROYAL_SLUG, "en");
}

export default async function EnAmlouRoyalPage() {
  return <LocalizedProductPage slug={AMLOU_ROYAL_SLUG} locale="en" />;
}
