import type { Metadata } from "next";

import {
  DEFAULT_LANGUAGE,
  isLanguage,
  languageDir,
  type Language,
} from "@/lib/i18n/types";

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.tazarzitbio.com"
).replace(/\/$/, "");

export const SEO_LOCALES: Language[] = ["ar", "fr", "en"];

export function localePrefix(locale: Language): string {
  if (locale === "fr") return "/fr";
  if (locale === "en") return "/en";
  return "";
}

/** Path without locale prefix, always starting with `/`. */
export function stripLocalePrefix(pathname: string): string {
  if (pathname === "/fr" || pathname.startsWith("/fr/")) {
    return pathname.slice(3) || "/";
  }
  if (pathname === "/en" || pathname.startsWith("/en/")) {
    return pathname.slice(3) || "/";
  }
  return pathname.startsWith("/") ? pathname : `/${pathname}`;
}

export function localizedPath(locale: Language, path: string): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  if (clean === "/") return localePrefix(locale) || "/";
  return `${localePrefix(locale)}${clean}`;
}

export function absoluteLocalizedUrl(locale: Language, path: string): string {
  const p = localizedPath(locale, path);
  return `${SITE_URL}${p === "/" ? "" : p}` || SITE_URL;
}

export function ogLocale(locale: Language): string {
  if (locale === "fr") return "fr_MA";
  if (locale === "en") return "en_MA";
  return "ar_MA";
}

export function hreflangLanguages(path: string): NonNullable<
  Metadata["alternates"]
>["languages"] {
  const bare = stripLocalePrefix(path);
  return {
    "ar-MA": localizedPath("ar", bare),
    "fr-MA": localizedPath("fr", bare),
    "en-MA": localizedPath("en", bare),
    "x-default": localizedPath("ar", bare),
  };
}

export function localeHtmlAttrs(locale: Language) {
  return {
    lang: locale === "ar" ? "ar" : locale,
    dir: languageDir(locale),
  };
}

export function parseLocale(value: string | null | undefined): Language {
  if (value && isLanguage(value)) return value;
  return DEFAULT_LANGUAGE;
}

export const MOROCCO_PRODUCT_KEYWORDS = {
  ar: [
    "أملو",
    "أملو المغرب",
    "شراء أملو أونلاين",
    "أملو طبيعي",
    "زيت أركان",
    "عسل طبيعي المغرب",
    "تازارزيت بيو",
    "الدفع عند الاستلام",
  ],
  fr: [
    "amlou",
    "amlou maroc",
    "acheter amlou",
    "amlou en ligne",
    "huile d'argan alimentaire",
    "miel naturel maroc",
    "paiement à la livraison",
    "tazarzit bio",
  ],
  en: [
    "amlou",
    "amlou morocco",
    "buy amlou",
    "natural amlou",
    "argan oil food",
    "moroccan honey",
    "cash on delivery morocco",
    "tazarzit bio",
  ],
} as const;
