import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { ProductPageClient } from "@/components/product/product-page-client";
import { FAMILY_PACK_SLUG } from "@/lib/brand";
import { toPublicProduct } from "@/lib/products/catalog";
import { getMergedCatalog, getMergedProductBySlug } from "@/lib/products/cms-catalog";
import { getProductShopPath } from "@/lib/products/amlou-royal";
import { JsonLd, productJsonLd } from "@/lib/seo/json-ld";

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

  const path = getProductShopPath(slug);
  return {
    title: product.nameAr,
    description: product.shortDescription,
    alternates: {
      canonical: path,
    },
    openGraph: {
      title: product.nameAr,
      description: product.shortDescription,
      images: [{ url: product.image, alt: product.nameAr }],
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
      <ProductPageClient slug={slug} initialProduct={publicProduct} />
    </>
  );
}
