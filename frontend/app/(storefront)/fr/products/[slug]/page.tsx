import type { Metadata } from "next";

import {
  LocalizedProductPage,
  localizedProductMetadata,
  localizedProductStaticParams,
} from "@/lib/seo/localized-product-page";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return localizedProductStaticParams();
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  return localizedProductMetadata(slug, "fr");
}

export default async function FrProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  return <LocalizedProductPage slug={slug} locale="fr" />;
}
