import { NextResponse } from "next/server";

import {
  ADMIN_COOKIE_NAME,
  ADMIN_SESSION_MAX_AGE,
  createAdminSessionToken,
  isAdminPasswordConfigured,
  shouldUseSecureAdminCookie,
  verifyAdminPassword,
} from "@/lib/admin/auth";
import { logAudit } from "@/lib/server/audit";

/**
 * POST /api/admin/login
 * Body: { "password": "..." }
 * Rate-limited per IP. On success sets a signed httpOnly session cookie.
 *
 * Reads ADMIN_PASSWORD / ADMIN_PASSWORD_SHA256 from the *runtime* process
 * environment (EasyPanel Environment variables), not from client code.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 8;

const attempts = new Map<string, { count: number; windowStart: number }>();

function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || now - entry.windowStart > WINDOW_MS) return false;
  return entry.count >= MAX_ATTEMPTS;
}

function recordFailure(ip: string) {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || now - entry.windowStart > WINDOW_MS) {
    attempts.set(ip, { count: 1, windowStart: now });
  } else {
    entry.count += 1;
  }
}

export async function POST(req: Request) {
  if (!isAdminPasswordConfigured()) {
    return NextResponse.json(
      {
        error: "Admin password not configured on server",
        code: "ADMIN_PASSWORD_MISSING",
      },
      { status: 503 },
    );
  }

  const ip = clientIp(req);
  if (isRateLimited(ip)) {
    return NextResponse.json(
      {
        error: "Too many attempts. Try again in a few minutes.",
        code: "RATE_LIMITED",
      },
      { status: 429 },
    );
  }

  let body: { password?: string } | null = null;
  try {
    body = (await req.json()) as { password?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const provided = (body?.password ?? "").toString();
  const ok = await verifyAdminPassword(provided);
  if (!ok) {
    recordFailure(ip);
    return NextResponse.json(
      { error: "Unauthorized", code: "INVALID_PASSWORD" },
      { status: 401 },
    );
  }

  attempts.delete(ip);
  void logAudit("Admin signed in", "auth");

  try {
    const token = await createAdminSessionToken();
    const res = NextResponse.json({ ok: true });
    res.cookies.set(ADMIN_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: shouldUseSecureAdminCookie(),
      path: "/",
      maxAge: ADMIN_SESSION_MAX_AGE,
    });
    return res;
  } catch {
    return NextResponse.json(
      {
        error: "Admin session secret is not configured on server",
        code: "SESSION_SECRET_MISSING",
      },
      { status: 503 },
    );
  }
}
