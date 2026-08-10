import { NextResponse, type NextRequest } from "next/server";

import { ADMIN_COOKIE_NAME, isAdminRequest } from "@/lib/admin/auth";

/**
 * Protects /admin pages and /api/admin/* using the httpOnly tazarzit_admin
 * session cookie (signed HMAC token — see lib/admin/auth.ts).
 */
export async function middleware(req: NextRequest) {
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

  if (await isAdminRequest(req)) return NextResponse.next();

  if (pathname.startsWith("/api/admin/")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // clear invalid cookie if present
  const res = NextResponse.redirect(new URL("/admin/login", req.url));
  res.cookies.set(ADMIN_COOKIE_NAME, "", { path: "/", maxAge: 0 });
  return res;
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
