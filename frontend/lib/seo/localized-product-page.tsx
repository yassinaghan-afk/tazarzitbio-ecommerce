import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { ProductPageClient } from "@/components/product/product-page-client";
import { FAMILY_PACK_SLUG } from "@/lib/brand";
import { localizeProductName } from "@/lib/i18n/product-locale";
import type { Language } from "@/lib/i18n/types";
import {
  AMLOU_ROYAL_SHOP_PATH,
  AMLOU_ROYAL_SLUG,
  getProductShopPath,
} from "@/lib/products/amlou-royal";
import { toPublicProduct } from "@/lib/products/catalog";
import {
  getMergedCatalog,
  getMergedProductBySlug,
} from "@/lib/products/cms-catalog";
import {
  breadcrumbJsonLd,
  faqPageJsonLd,
  JsonLd,
  productJsonLd,
} from "@/lib/seo/json-ld";
import { localizedPath } from "@/lib/seo/locale";
import {
  buildProductSeoMetadata,
  localizedProductFaqs,
} from "@/lib/seo/product-metadata";
import { getCmsProductSeo } from "@/lib/seo/product-seo";

function shopPathForSlug(slug: string): string {
  return slug === AMLOU_ROYAL_SLUG
    ? AMLOU_ROYAL_SHOP_PATH
    : getProductShopPath(slug);
}

export async function localizedProductStaticParams() {
  const catalog = await getMergedCatalog();
  return catalog
    .filter((p) => p.slug !== FAMILY_PACK_SLUG)
    .map((p) => ({ slug: p.slug }));
}

export async function localizedProductMetadata(
  slug: string,
  locale: Language,
): Promise<Metadata> {
  if (slug === FAMILY_PACK_SLUG) {
    return {
      title:
        locale === "fr" ? "Produits" : locale === "en" ? "Products" : "المنتجات",
    };
  }
  const product = await getMergedProductBySlug(slug);
  if (!product) {
    return {
      title:
        locale === "fr"
          ? "Produit introuvable"
          : locale === "en"
            ? "Product not found"
            : "منتج غير موجود",
    };
  }

  const publicProduct = toPublicProduct(product);
  const path = shopPathForSlug(slug);
  const { seoTitle, seoDescription } = await getCmsProductSeo(slug);

  return buildProductSeoMetadata({
    product: publicProduct,
    locale,
    path,
    seoTitle: locale === "ar" ? seoTitle : undefined,
    seoDescription: locale === "ar" ? seoDescription : undefined,
  });
}

export async function LocalizedProductPage({
  slug,
  locale,
}: {
  slug: string;
  locale: Language;
}) {
  if (slug === FAMILY_PACK_SLUG) {
    redirect(localizedPath(locale, "/products"));
  }
  const product = await getMergedProductBySlug(slug);
  if (!product) notFound();

  const publicProduct = toPublicProduct(product);
  const path = shopPathForSlug(slug);
  const localizedPathForLd = localizedPath(locale, path);
  const faqs = localizedProductFaqs(publicProduct, locale);
  const homeLabel =
    locale === "fr" ? "Accueil" : locale === "en" ? "Home" : "الرئيسية";
  const productsLabel =
    locale === "fr" ? "Produits" : locale === "en" ? "Products" : "المنتجات";
  const name = localizeProductName(publicProduct, locale);

  return (
    <>
      <JsonLd data={productJsonLd(publicProduct, localizedPathForLd, locale)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: homeLabel, path: localizedPath(locale, "/") },
          { name: productsLabel, path: localizedPath(locale, "/products") },
          { name, path: localizedPathForLd },
        ])}
      />
      {faqs.length > 0 ? <JsonLd data={faqPageJsonLd(faqs)} /> : null}
      <ProductPageClient slug={slug} initialProduct={publicProduct} />
    </>
  );
}
