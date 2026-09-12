import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { ProductPageClient } from "@/components/product/product-page-client";
import { FAMILY_PACK_SLUG } from "@/lib/brand";
import { toPublicProduct } from "@/lib/products/catalog";
import { getMergedCatalog, getMergedProductBySlug } from "@/lib/products/cms-catalog";

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

  return {
    title: product.nameAr,
    description: product.shortDescription,
    openGraph: {
      images: [{ url: product.image }],
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

  return (
    <ProductPageClient slug={slug} initialProduct={toPublicProduct(product)} />
  );
}
