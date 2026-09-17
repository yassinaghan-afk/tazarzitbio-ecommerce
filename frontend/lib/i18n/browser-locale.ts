import {
  DEFAULT_LANGUAGE,
  isLanguage,
  type Language,
} from "@/lib/i18n/types";

/** Cookie set after first browser-language detect or manual language switch. */
export const LANGUAGE_PREF_COOKIE = "tazarzit-lang-pref";

const PREF_MAX_AGE = 60 * 60 * 24 * 365;

export function languagePrefCookieOptions() {
  return {
    path: "/",
    sameSite: "lax" as const,
    maxAge: PREF_MAX_AGE,
  };
}

/**
 * Best matching site language from Accept-Language (q-ordered).
 * Prefers exact ar/fr/en tags; falls back to language primary subtag.
 */
export function localeFromAcceptLanguage(
  header: string | null | undefined,
): Language | null {
  if (!header?.trim()) return null;

  const parts = header.split(",").map((raw) => {
    const [tagPart, ...params] = raw.trim().split(";");
    const tag = (tagPart || "").trim().toLowerCase();
    let q = 1;
    for (const p of params) {
      const m = p.trim().match(/^q=([0-9.]+)$/i);
      if (m) q = Number(m[1]) || 0;
    }
    return { tag, q };
  });

  parts.sort((a, b) => b.q - a.q);

  for (const { tag, q } of parts) {
    if (!tag || q <= 0) continue;
    if (isLanguage(tag)) return tag;
    const primary = tag.split("-")[0];
    if (primary && isLanguage(primary)) return primary;
  }

  return null;
}

export function resolvePreferredLocale(
  header: string | null | undefined,
): Language {
  return localeFromAcceptLanguage(header) ?? DEFAULT_LANGUAGE;
}

const BOT_UA =
  /googlebot|bingbot|yandex|baiduspider|duckduckbot|slurp|facebookexternalhit|twitterbot|linkedinbot|embedly|quora link preview|showyoubot|outbrain|pinterest|applebot|semrush|ahrefs|mj12bot|dotbot|petalbot|bytespider/i;

export function isLikelyBot(userAgent: string | null | undefined): boolean {
  if (!userAgent) return false;
  return BOT_UA.test(userAgent);
}

/** Campaign / checkout flows that should keep their dedicated URLs. */
export function shouldSkipBrowserLocaleRedirect(pathname: string): boolean {
  if (pathname.startsWith("/api/")) return true;
  if (pathname.startsWith("/admin")) return true;
  if (pathname === "/royal" || pathname.startsWith("/royal/")) return true;
  if (pathname === "/royalfr" || pathname.startsWith("/royalfr/")) return true;
  if (pathname === "/upsell" || pathname.startsWith("/upsell/")) return true;
  if (pathname === "/thank-you" || pathname.startsWith("/thank-you/")) {
    return true;
  }
  if (pathname.startsWith("/lp/")) return true;
  return false;
}
