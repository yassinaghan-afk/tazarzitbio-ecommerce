import { NextResponse, type NextRequest } from "next/server";

import { ADMIN_COOKIE_NAME, isAdminRequest } from "@/lib/admin/auth";

/**
 * Protects /admin pages and /api/admin/* using the httpOnly tazarzit_admin cookie.
 * Login sets the cookie after ADMIN_PASSWORD matches (see /api/admin/login).
 */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isAdminPath =
    pathname === "/admin" ||
    pathname.startsWith("/admin/") ||
    pathname.startsWith("/api/admin/");

  if (!isAdminPath) return NextResponse.next();

  // allow login endpoints/pages
  if (
    pathname === "/admin/login" ||
    pathname.startsWith("/api/admin/login") ||
    pathname.startsWith("/api/admin/logout")
  ) {
    return NextResponse.next();
  }

  if (isAdminRequest(req)) return NextResponse.next();

  // clear invalid cookie if present
  const res = NextResponse.redirect(new URL("/admin/login", req.url));
  res.cookies.set(ADMIN_COOKIE_NAME, "", { path: "/", maxAge: 0 });
  return res;
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};

