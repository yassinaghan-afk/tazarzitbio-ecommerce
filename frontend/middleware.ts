import { NextResponse, type NextRequest } from "next/server";

import { ADMIN_COOKIE_NAME, isAdminRequest } from "@/lib/admin/auth";
import { DEFAULT_LANGUAGE, isLanguage, type Language } from "@/lib/i18n/types";

function localeFromPath(pathname: string): Language {
  if (pathname === "/fr" || pathname.startsWith("/fr/")) return "fr";
  if (pathname === "/en" || pathname.startsWith("/en/")) return "en";
  return DEFAULT_LANGUAGE;
}

/**
 * - Protects /admin and /api/admin/*
 * - Sets x-locale for storefront SEO (ar default, /fr, /en)
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

  const locale = localeFromPath(pathname);
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
