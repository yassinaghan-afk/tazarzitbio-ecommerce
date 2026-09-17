import type { Metadata } from "next";

import {
  localizeProductDescription,
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

const META_DESC_MAX = 158;

function moroccoSuffix(locale: Language): string {
  if (locale === "fr") return "Livraison Maroc · Paiement à la livraison.";
  if (locale === "en") return "Morocco delivery · Cash on delivery.";
  return "توصيل المغرب · الدفع عند الاستلام.";
}

/** Prefer unique long copy for SERP; fall back to short + Morocco intent. */
export function buildProductMetaDescription(
  product: PublicProduct,
  locale: Language,
  seoDescription?: string,
): string {
  const custom = seoDescription?.trim();
  if (custom) return clipMeta(custom);

  const long = localizeProductDescription(product, locale).trim();
  const short = localizeProductShortDescription(product, locale).trim();
  const base = long.length >= 80 ? long : `${short} ${moroccoSuffix(locale)}`.trim();
  return clipMeta(base);
}

function clipMeta(text: string): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= META_DESC_MAX) return clean;
  const sliced = clean.slice(0, META_DESC_MAX - 1);
  const cut = sliced.lastIndexOf(" ");
  return `${(cut > 80 ? sliced.slice(0, cut) : sliced).trim()}…`;
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
  const title =
    seoTitle?.trim() ||
    (locale === "fr"
      ? `${name} — Acheter au Maroc | Tazarzit Bio`
      : locale === "en"
        ? `${name} — Buy in Morocco | Tazarzit Bio`
        : `${name} — شراء أونلاين المغرب | تازارزيت بيو`);
  const description = buildProductMetaDescription(
    product,
    locale,
    seoDescription,
  );

  const canonical = localizedPath(locale, path);

  return {
    // absolute avoids double brand from root layout template `%s | تازارزيت بيو`
    title: { absolute: title },
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
