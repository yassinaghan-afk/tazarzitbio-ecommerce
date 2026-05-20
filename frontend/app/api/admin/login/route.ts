import { NextResponse } from "next/server";

import { ADMIN_COOKIE_NAME, createAdminCookieValue } from "@/lib/admin/auth";

export async function POST(req: Request) {
  let body: { password?: string } | null = null;
  try {
    body = (await req.json()) as { password?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const provided = (body?.password ?? "").toString();
  const expected = process.env.ADMIN_PASSWORD ?? "";
  if (!expected || provided !== expected) {
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

