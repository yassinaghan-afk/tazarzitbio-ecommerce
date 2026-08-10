import type { NextRequest } from "next/server";

/**
 * Admin authentication (server-only)
 * ---------------------------------
 * Login password (runtime env — set in EasyPanel → Environment, then redeploy):
 *   ADMIN_PASSWORD              plain password typed at /admin/login
 *   — OR —
 *   ADMIN_PASSWORD_SHA256       hex SHA-256 of that password
 *
 * Optional but strongly recommended:
 *   ADMIN_SESSION_SECRET        long random secret used to sign session cookies
 *   ADMIN_COOKIE_VALUE          legacy alias for the session signing secret
 *
 * NOT used / not required:
 *   ADMIN_USERNAME, ADMIN_EMAIL, AUTH_SECRET, SESSION_SECRET, NEXTAUTH_*
 *   NEXT_PUBLIC_*  (never put secrets here)
 *
 * Sessions: after login the browser receives an httpOnly cookie with a signed,
 * expiring token (HMAC-SHA256). The password is NEVER stored in the cookie.
 *
 * Protection:
 *   - middleware.ts — blocks /admin/* and /api/admin/* (except login/logout)
 *   - isAdminRequest() — used by each /api/admin/* route handler
 *
 * Env is always read at runtime (process.env[name]), never hardcoded.
 * Docker/EasyPanel must inject these as *runtime* container env vars
 * (not only Dockerfile ARG / build args).
 */

const COOKIE_NAME = "tazarzit_admin";
const TOKEN_PREFIX = "v2";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 14; // 14 days

export const ADMIN_COOKIE_NAME = COOKIE_NAME;
export const ADMIN_SESSION_MAX_AGE = SESSION_MAX_AGE_SECONDS;

/**
 * Read a server env var at runtime.
 * Trims whitespace and strips one layer of surrounding quotes
 * (common when values are pasted into hosting UIs as "secret").
 */
function readEnv(name: string): string {
  // Bracket access keeps this a true runtime lookup (not a build-time constant).
  const raw = process.env[name];
  if (raw == null) return "";
  let value = String(raw).trim();
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1).trim();
  }
  return value;
}

/** Login password from env. Empty means admin login is disabled. */
export function getAdminPassword(): string {
  return readEnv("ADMIN_PASSWORD");
}

export function getAdminPasswordSha256(): string {
  return readEnv("ADMIN_PASSWORD_SHA256").toLowerCase();
}

function getSessionSecret(): string {
  return (
    readEnv("ADMIN_SESSION_SECRET") ||
    readEnv("ADMIN_COOKIE_VALUE") ||
    getAdminPassword() ||
    getAdminPasswordSha256()
  );
}

/** True when either password form is configured at runtime. */
export function isAdminPasswordConfigured(): boolean {
  return Boolean(getAdminPassword() || getAdminPasswordSha256());
}

/**
 * Whether the session cookie should use the Secure flag.
 * Defaults to production. Override with ADMIN_COOKIE_SECURE=true|false
 * when debugging behind an unusual proxy setup.
 */
export function shouldUseSecureAdminCookie(): boolean {
  const override = readEnv("ADMIN_COOKIE_SECURE").toLowerCase();
  if (override === "true" || override === "1") return true;
  if (override === "false" || override === "0") return false;
  return process.env.NODE_ENV === "production";
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

/** Constant-time string comparison. */
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
 *
 * ADMIN_PASSWORD_SHA256 takes priority when non-empty.
 */
export async function verifyAdminPassword(provided: string): Promise<boolean> {
  const password = provided.toString();
  if (!password) return false;

  const storedHash = getAdminPasswordSha256();
  if (storedHash) {
    const providedHash = await sha256Hex(password);
    return timingSafeEqual(providedHash, storedHash);
  }

  const expected = getAdminPassword();
  if (!expected) return false;
  const [a, b] = await Promise.all([sha256Hex(password), sha256Hex(expected)]);
  return timingSafeEqual(a, b);
}

/** Create a signed session token: "v2.<expiresEpochSeconds>.<hmac>" */
export async function createAdminSessionToken(): Promise<string> {
  const secret = getSessionSecret();
  if (!secret) {
    throw new Error("Admin session secret is not configured");
  }
  const expires = Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SECONDS;
  const payload = `${TOKEN_PREFIX}.${expires}`;
  const sig = await hmacHex(secret, payload);
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
