import type { NextRequest } from "next/server";

/**
 * Admin authentication (server-only)
 * ---------------------------------
 * Login: the password typed at /admin/login is checked against ADMIN_PASSWORD
 * (or ADMIN_PASSWORD_SHA256 — a hex SHA-256 hash — if you prefer not to store
 * the plaintext password in the environment).
 *
 * Sessions: after a successful login the browser receives an httpOnly cookie
 * containing a signed, expiring session token (HMAC-SHA256). The password is
 * NEVER stored in the cookie. Tokens are signed with ADMIN_SESSION_SECRET
 * (falls back to ADMIN_COOKIE_VALUE, then ADMIN_PASSWORD).
 *
 * Protection:
 *   - middleware.ts — blocks /admin/* and /api/admin/* (except login/logout)
 *   - isAdminRequest() — used by each /api/admin/* route handler
 *
 * Uses the Web Crypto API so it works in both the Edge runtime (middleware)
 * and the Node.js runtime (route handlers).
 */

const COOKIE_NAME = "tazarzit_admin";
const TOKEN_PREFIX = "v2";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 14; // 14 days

export const ADMIN_COOKIE_NAME = COOKIE_NAME;
export const ADMIN_SESSION_MAX_AGE = SESSION_MAX_AGE_SECONDS;

/** Login password from env. Empty means admin login is disabled. */
export function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD ?? "";
}

function getSessionSecret(): string {
  return (
    process.env.ADMIN_SESSION_SECRET ||
    process.env.ADMIN_COOKIE_VALUE ||
    getAdminPassword()
  );
}

const encoder = new TextEncoder();

function bytesToHex(bytes: ArrayBuffer): string {
  return Array.from(new Uint8Array(bytes))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function sha256Hex(data: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(data));
  return bytesToHex(digest);
}

async function hmacHex(secret: string, data: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  return bytesToHex(sig);
}

/** Constant-time string comparison (both inputs are hex of equal length in practice). */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

/**
 * Verify a login password. Comparison happens on SHA-256 digests so it is
 * constant-time regardless of password length. Supports either:
 *   - ADMIN_PASSWORD_SHA256 (hex hash of the password), or
 *   - ADMIN_PASSWORD (plaintext in env)
 */
export async function verifyAdminPassword(provided: string): Promise<boolean> {
  if (!provided) return false;
  const storedHash = process.env.ADMIN_PASSWORD_SHA256;
  if (storedHash) {
    const providedHash = await sha256Hex(provided);
    return timingSafeEqual(providedHash, storedHash.trim().toLowerCase());
  }
  const expected = getAdminPassword();
  if (!expected) return false;
  const [a, b] = await Promise.all([sha256Hex(provided), sha256Hex(expected)]);
  return timingSafeEqual(a, b);
}

/** Create a signed session token: "v2.<expiresEpochSeconds>.<hmac>" */
export async function createAdminSessionToken(): Promise<string> {
  const expires = Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SECONDS;
  const payload = `${TOKEN_PREFIX}.${expires}`;
  const sig = await hmacHex(getSessionSecret(), payload);
  return `${payload}.${sig}`;
}

export async function isValidAdminCookieValue(
  value: string | undefined | null,
): Promise<boolean> {
  const secret = getSessionSecret();
  if (!secret || !value) return false;
  const parts = value.split(".");
  if (parts.length !== 3 || parts[0] !== TOKEN_PREFIX) return false;
  const expires = Number(parts[1]);
  if (!Number.isFinite(expires) || expires * 1000 < Date.now()) return false;
  const expected = await hmacHex(secret, `${parts[0]}.${parts[1]}`);
  return timingSafeEqual(expected, parts[2]);
}

export async function isAdminRequest(req: NextRequest): Promise<boolean> {
  const cookie = req.cookies.get(COOKIE_NAME)?.value;
  return isValidAdminCookieValue(cookie);
}
