import { NextResponse, type NextRequest } from "next/server";

import { ADMIN_COOKIE_NAME, isAdminRequest } from "@/lib/admin/auth";
import {
  isLikelyBot,
  LANGUAGE_PREF_COOKIE,
  languagePrefCookieOptions,
  localeFromAcceptLanguage,
  shouldSkipBrowserLocaleRedirect,
} from "@/lib/i18n/browser-locale";
import { DEFAULT_LANGUAGE, isLanguage, type Language } from "@/lib/i18n/types";
import { localizedPath, stripLocalePrefix } from "@/lib/seo/locale";

function localeFromPath(pathname: string): Language {
  if (pathname === "/fr" || pathname.startsWith("/fr/")) return "fr";
  if (pathname === "/en" || pathname.startsWith("/en/")) return "en";
  return DEFAULT_LANGUAGE;
}

function redirectToLocale(
  req: NextRequest,
  locale: Language,
  barePath: string,
) {
  const url = req.nextUrl.clone();
  url.pathname = localizedPath(locale, barePath);
  const res = NextResponse.redirect(url);
  res.cookies.set(LANGUAGE_PREF_COOKIE, locale, languagePrefCookieOptions());
  res.cookies.set("tazarzit-seo-locale", locale, {
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}

/**
 * - Protects /admin and /api/admin/*
 * - Browser / saved language: unprefixed URLs (e.g. ad → /) open in that language
 * - Sets x-locale for storefront SEO
 */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isAdminPath =
    pathname === "/admin" ||
    pathname.startsWith("/admin/") ||
    pathname.startsWith("/api/admin/");

  if (isAdminPath) {
    if (
      pathname === "/admin/login" ||
      pathname.startsWith("/api/admin/login") ||
      pathname.startsWith("/api/admin/logout")
    ) {
      return NextResponse.next();
    }

    if (await isAdminRequest(req)) return NextResponse.next();

    if (pathname.startsWith("/api/admin/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const res = NextResponse.redirect(new URL("/admin/login", req.url));
    res.cookies.set(ADMIN_COOKIE_NAME, "", { path: "/", maxAge: 0 });
    return res;
  }

  const pathLocale = localeFromPath(pathname);
  const prefRaw = req.cookies.get(LANGUAGE_PREF_COOKIE)?.value;
  const pref = prefRaw && isLanguage(prefRaw) ? prefRaw : null;
  const skipLocaleRedirect = shouldSkipBrowserLocaleRedirect(pathname);
  const bot = isLikelyBot(req.headers.get("user-agent"));
  const bare = stripLocalePrefix(pathname);

  if (!bot && !skipLocaleRedirect && pathLocale === DEFAULT_LANGUAGE) {
    // Saved preference (ad final URL is often bare /)
    if (pref && pref !== DEFAULT_LANGUAGE) {
      return redirectToLocale(req, pref, bare);
    }
    // First visit: follow browser language
    if (!pref) {
      const browserLocale = localeFromAcceptLanguage(
        req.headers.get("accept-language"),
      );
      if (browserLocale && browserLocale !== DEFAULT_LANGUAGE) {
        return redirectToLocale(req, browserLocale, bare);
      }
    }
  }

  const locale = pathLocale;
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-locale", locale);

  const res = NextResponse.next({
    request: { headers: requestHeaders },
  });
  res.headers.set("x-locale", locale);
  if (isLanguage(locale)) {
    res.cookies.set("tazarzit-seo-locale", locale, {
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
    });
    // Don't overwrite FR/EN preference when hitting campaign LPs like /royal.
    if (locale !== DEFAULT_LANGUAGE || !skipLocaleRedirect) {
      res.cookies.set(
        LANGUAGE_PREF_COOKIE,
        locale,
        languagePrefCookieOptions(),
      );
    }
  }
  return res;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
    "/((?!_next/static|_next/image|.*\\..*).*)",
  ],
};
