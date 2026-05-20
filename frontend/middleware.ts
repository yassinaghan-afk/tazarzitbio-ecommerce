import { NextResponse, type NextRequest } from "next/server";

import { ADMIN_COOKIE_NAME, isAdminRequest } from "@/lib/admin/auth";

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

