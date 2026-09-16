import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProductPageClient } from "@/components/product/product-page-client";
import { toPublicProduct } from "@/lib/products/catalog";
import {
  AMLOU_ROYAL_SHOP_CANONICAL,
  AMLOU_ROYAL_SHOP_PATH,
  AMLOU_ROYAL_SLUG,
} from "@/lib/products/amlou-royal";
import { getMergedProductBySlug } from "@/lib/products/cms-catalog";
import { JsonLd, productJsonLd } from "@/lib/seo/json-ld";

export async function generateMetadata(): Promise<Metadata> {
  const product = await getMergedProductBySlug(AMLOU_ROYAL_SLUG);
  if (!product) {
    return { title: "أملو ملكي | تازارزيت بيو" };
  }

  return {
    title: `${product.nameAr} | تازارزيت بيو`,
    description: product.shortDescription,
    alternates: {
      canonical: AMLOU_ROYAL_SHOP_CANONICAL,
    },
    openGraph: {
      title: product.nameAr,
      description: product.shortDescription,
      url: AMLOU_ROYAL_SHOP_CANONICAL,
      images: [{ url: product.image, alt: product.nameAr }],
    },
  };
}

export default async function AmlouRoyalProductPage() {
  const product = await getMergedProductBySlug(AMLOU_ROYAL_SLUG);
  if (!product) notFound();

  const publicProduct = toPublicProduct(product);

  return (
    <>
      <JsonLd data={productJsonLd(publicProduct, AMLOU_ROYAL_SHOP_PATH)} />
      <ProductPageClient
        slug={AMLOU_ROYAL_SLUG}
        initialProduct={publicProduct}
      />
    </>
  );
}
