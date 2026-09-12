import type { NextRequest } from "next/server";

import type { AdminRole } from "@/lib/admin/ops-types";
import {
  createAdminSessionToken,
  isAdminRequest,
  isValidAdminCookieValue,
  verifyAdminPassword,
  ADMIN_COOKIE_NAME,
  ADMIN_SESSION_MAX_AGE,
  shouldUseSecureAdminCookie,
} from "@/lib/admin/auth";
import { readStore } from "@/lib/server/store";

export type AdminSession = {
  role: AdminRole;
  userId: string;
  userName: string;
};

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

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function readEnv(name: string): string {
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

function getSessionSecret(): string {
  return (
    readEnv("ADMIN_SESSION_SECRET") ||
    readEnv("ADMIN_COOKIE_VALUE") ||
    readEnv("ADMIN_PASSWORD") ||
    readEnv("ADMIN_PASSWORD_SHA256")
  );
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

/**
 * v3 session: v3.<role>.<userId>.<expires>.<hmac>
 * v2 session (legacy): treated as admin/owner
 */
export async function createRoleSessionToken(
  role: AdminRole,
  userId: string,
): Promise<string> {
  const secret = getSessionSecret();
  if (!secret) throw new Error("Admin session secret is not configured");
  const expires = Math.floor(Date.now() / 1000) + ADMIN_SESSION_MAX_AGE;
  const safeRole = role.replace(/[^a-z_]/g, "");
  const safeUser = userId.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 40) || "owner";
  const payload = `v3.${safeRole}.${safeUser}.${expires}`;
  const sig = await hmacHex(secret, payload);
  return `${payload}.${sig}`;
}

export async function parseAdminSession(
  req: NextRequest,
): Promise<AdminSession | null> {
  const cookie = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  if (!cookie) return null;

  const secret = getSessionSecret();
  if (!secret) return null;

  const parts = cookie.split(".");
  if (parts[0] === "v3" && parts.length === 5) {
    const [, role, userId, expiresStr, sig] = parts;
    const expires = Number(expiresStr);
    if (!Number.isFinite(expires) || expires * 1000 < Date.now()) return null;
    const expected = await hmacHex(
      secret,
      `v3.${role}.${userId}.${expiresStr}`,
    );
    if (!timingSafeEqual(expected, sig)) return null;
    if (
      role !== "admin" &&
      role !== "manager" &&
      role !== "confirmation_agent"
    ) {
      return null;
    }
    const store = await readStore();
    if (userId === "owner") {
      return { role: "admin", userId: "owner", userName: "Admin" };
    }
    const user = store.ops.adminUsers.find((u) => u.id === userId && u.isActive);
    if (!user) return null;
    return { role: user.role, userId: user.id, userName: user.name };
  }

  // Legacy v2 → full admin
  if (await isValidAdminCookieValue(cookie)) {
    return { role: "admin", userId: "owner", userName: "Admin" };
  }
  return null;
}

export async function requireAdminSession(
  req: NextRequest,
): Promise<AdminSession | null> {
  const session = await parseAdminSession(req);
  if (session) return session;
  if (await isAdminRequest(req)) {
    return { role: "admin", userId: "owner", userName: "Admin" };
  }
  return null;
}

export async function hashPassword(password: string): Promise<string> {
  return sha256Hex(password);
}

export async function verifyStaffPassword(
  provided: string,
  storedHash: string,
): Promise<boolean> {
  const hash = await sha256Hex(provided);
  return timingSafeEqual(hash, storedHash.toLowerCase());
}

export {
  createAdminSessionToken,
  verifyAdminPassword,
  ADMIN_COOKIE_NAME,
  ADMIN_SESSION_MAX_AGE,
  shouldUseSecureAdminCookie,
  isAdminRequest,
};
