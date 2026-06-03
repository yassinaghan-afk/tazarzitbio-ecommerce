import { NextResponse } from "next/server";

import {
  ADMIN_COOKIE_NAME,
  createAdminCookieValue,
  getAdminPassword,
} from "@/lib/admin/auth";

/**
 * POST /api/admin/login
 * Body: { "password": "..." }
 * Compares password to process.env.ADMIN_PASSWORD (see lib/admin/auth.ts).
 */
export async function POST(req: Request) {
  const expected = getAdminPassword();
  if (!expected) {
    return NextResponse.json(
      { error: "Admin password not configured on server" },
      { status: 503 },
    );
  }

  let body: { password?: string } | null = null;
  try {
    body = (await req.json()) as { password?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const provided = (body?.password ?? "").toString();
  if (provided !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE_NAME, createAdminCookieValue(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 14, // 14 days
  });
  return res;
}
