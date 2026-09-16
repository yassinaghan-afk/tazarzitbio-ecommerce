import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { ProductPageClient } from "@/components/product/product-page-client";
import { FAMILY_PACK_SLUG } from "@/lib/brand";
import { toPublicProduct } from "@/lib/products/catalog";
import { getMergedCatalog, getMergedProductBySlug } from "@/lib/products/cms-catalog";
import { getProductShopPath } from "@/lib/products/amlou-royal";
import {
  breadcrumbJsonLd,
  faqPageJsonLd,
  JsonLd,
  productJsonLd,
} from "@/lib/seo/json-ld";
import { getCmsProductSeo } from "@/lib/seo/product-seo";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const catalog = await getMergedCatalog();
  return catalog
    .filter((p) => p.slug !== FAMILY_PACK_SLUG)
    .map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  if (slug === FAMILY_PACK_SLUG) {
    return { title: "المنتجات" };
  }
  const product = await getMergedProductBySlug(slug);
  if (!product) return { title: "منتج غير موجود" };

  const { seoTitle, seoDescription } = await getCmsProductSeo(slug);
  const title = seoTitle || product.nameAr;
  const description = seoDescription || product.shortDescription;
  const path = getProductShopPath(slug);

  return {
    title,
    description,
    alternates: {
      canonical: path,
    },
    openGraph: {
      type: "website",
      title,
      description,
      url: path,
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

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  if (slug === FAMILY_PACK_SLUG) {
    redirect("/products");
  }
  const product = await getMergedProductBySlug(slug);
  if (!product) notFound();

  const publicProduct = toPublicProduct(product);
  const path = getProductShopPath(slug);

  return (
    <>
      <JsonLd data={productJsonLd(publicProduct, path)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "الرئيسية", path: "/" },
          { name: "المنتجات", path: "/products" },
          { name: product.nameAr, path },
        ])}
      />
      {publicProduct.faq.length > 0 ? (
        <JsonLd data={faqPageJsonLd(publicProduct.faq)} />
      ) : null}
      <ProductPageClient slug={slug} initialProduct={publicProduct} />
    </>
  );
}
