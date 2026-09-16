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
import {
  breadcrumbJsonLd,
  faqPageJsonLd,
  JsonLd,
  productJsonLd,
} from "@/lib/seo/json-ld";
import { getCmsProductSeo } from "@/lib/seo/product-seo";

export async function generateMetadata(): Promise<Metadata> {
  const product = await getMergedProductBySlug(AMLOU_ROYAL_SLUG);
  if (!product) {
    return { title: "أملو ملكي | تازارزيت بيو" };
  }

  const { seoTitle, seoDescription } = await getCmsProductSeo(AMLOU_ROYAL_SLUG);
  const title = seoTitle || `${product.nameAr} | تازارزيت بيو`;
  const description = seoDescription || product.shortDescription;

  return {
    title,
    description,
    alternates: {
      canonical: AMLOU_ROYAL_SHOP_CANONICAL,
    },
    openGraph: {
      title,
      description,
      url: AMLOU_ROYAL_SHOP_CANONICAL,
      images: [{ url: product.image, alt: product.nameAr }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [product.image],
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
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "الرئيسية", path: "/" },
          { name: "المنتجات", path: "/products" },
          { name: product.nameAr, path: AMLOU_ROYAL_SHOP_PATH },
        ])}
      />
      {publicProduct.faq.length > 0 ? (
        <JsonLd data={faqPageJsonLd(publicProduct.faq)} />
      ) : null}
      <ProductPageClient
        slug={AMLOU_ROYAL_SLUG}
        initialProduct={publicProduct}
      />
    </>
  );
}
