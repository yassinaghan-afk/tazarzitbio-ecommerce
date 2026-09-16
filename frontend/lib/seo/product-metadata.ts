import type { Metadata } from "next";

import {
  localizeProductFaq,
  localizeProductName,
  localizeProductShortDescription,
} from "@/lib/i18n/product-locale";
import type { Language } from "@/lib/i18n/types";
import type { PublicProduct } from "@/lib/products/types";
import {
  absoluteLocalizedUrl,
  hreflangLanguages,
  localizedPath,
  MOROCCO_PRODUCT_KEYWORDS,
  ogLocale,
} from "@/lib/seo/locale";

function moroccoSuffix(locale: Language): string {
  if (locale === "fr") return "Livraison Maroc · Paiement à la livraison";
  if (locale === "en") return "Morocco delivery · Cash on delivery";
  return "توصيل المغرب · الدفع عند الاستلام";
}

export function buildProductSeoMetadata(input: {
  product: PublicProduct;
  locale: Language;
  /** Path without locale prefix, e.g. `/amlouroyal` or `/products/slug` */
  path: string;
  seoTitle?: string;
  seoDescription?: string;
}): Metadata {
  const { product, locale, path, seoTitle, seoDescription } = input;
  const name = localizeProductName(product, locale);
  const short = localizeProductShortDescription(product, locale);
  const title =
    seoTitle?.trim() ||
    (locale === "fr"
      ? `${name} — Acheter au Maroc | Tazarzit Bio`
      : locale === "en"
        ? `${name} — Buy in Morocco | Tazarzit Bio`
        : `${name} — شراء أونلاين المغرب | تازارزيت بيو`);
  const description =
    seoDescription?.trim() ||
    `${short} ${moroccoSuffix(locale)}`.trim();

  const canonical = localizedPath(locale, path);

  return {
    title,
    description,
    keywords: [...MOROCCO_PRODUCT_KEYWORDS[locale], name],
    alternates: {
      canonical,
      languages: hreflangLanguages(path),
    },
    openGraph: {
      type: "website",
      locale: ogLocale(locale),
      title,
      description,
      url: absoluteLocalizedUrl(locale, path),
      images: [{ url: product.image, alt: name }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [product.image],
    },
  };
}

export function localizedProductFaqs(
  product: PublicProduct,
  locale: Language,
) {
  return localizeProductFaq(product.faq, product.slug, locale);
}
