import type { NextRequest } from "next/server";

const COOKIE_NAME = "tazarzit_admin";

function expectedCookieValue(): string {
  // Simple auth layer: cookie must match server-side secret.
  // Set ADMIN_COOKIE_VALUE (recommended) or fall back to ADMIN_PASSWORD for dev.
  return (
    process.env.ADMIN_COOKIE_VALUE ??
    process.env.ADMIN_PASSWORD ??
    "dev-admin-change-me"
  );
}

export function createAdminCookieValue(): string {
  return expectedCookieValue();
}

export function isValidAdminCookieValue(
  value: string | undefined | null,
): boolean {
  if (!value) return false;
  return value === expectedCookieValue();
}

export function isAdminRequest(req: NextRequest): boolean {
  const cookie = req.cookies.get(COOKIE_NAME)?.value;
  return isValidAdminCookieValue(cookie);
}

export const ADMIN_COOKIE_NAME = COOKIE_NAME;

