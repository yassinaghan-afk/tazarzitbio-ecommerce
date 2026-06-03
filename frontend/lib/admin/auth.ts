import type { NextRequest } from "next/server";

/**
 * Admin authentication (server-only)
 * ---------------------------------
 * Password you type at /admin/login is checked against ADMIN_PASSWORD.
 *
 * To change admin access later:
 *   1. Set ADMIN_PASSWORD in frontend/.env.local (local dev) or your host env
 *      (e.g. EasyPanel → Environment → ADMIN_PASSWORD).
 *   2. Redeploy / restart the app so the new value is loaded.
 *   3. Sign out of admin (or clear the tazarzit_admin cookie) and sign in again.
 *
 * Optional: ADMIN_COOKIE_VALUE — httpOnly cookie value after login. Defaults to
 * ADMIN_PASSWORD. Use a separate long random string only if you want the login
 * password and session cookie secret to differ.
 *
 * Protection:
 *   - middleware.ts — blocks /admin/* and /api/admin/* (except login/logout)
 *   - isAdminRequest() — used by each /api/admin/* route handler
 */

const COOKIE_NAME = "tazarzit_admin";

/** Login password from env. Empty means admin login is disabled. */
export function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD ?? "";
}

function expectedCookieValue(): string {
  return process.env.ADMIN_COOKIE_VALUE ?? getAdminPassword();
}

export function createAdminCookieValue(): string {
  return expectedCookieValue();
}

export function isValidAdminCookieValue(
  value: string | undefined | null,
): boolean {
  const expected = expectedCookieValue();
  if (!expected || !value) return false;
  return value === expected;
}

export function isAdminRequest(req: NextRequest): boolean {
  const cookie = req.cookies.get(COOKIE_NAME)?.value;
  return isValidAdminCookieValue(cookie);
}

export const ADMIN_COOKIE_NAME = COOKIE_NAME;
