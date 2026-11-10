import { type NextRequest, NextResponse } from "next/server";

import { requireAdminSession } from "@/lib/admin/session";

/**
 * Proxy helpers for the video studio service (video/ in the repo root).
 * Runtime env (EasyPanel → Environment):
 *   VIDEO_SERVICE_URL    internal URL of the video service, e.g. http://tazarzit_video:8000
 *   VIDEO_SERVICE_TOKEN  shared secret, same value as on the video service
 */

const JOB_ID = /^[a-f0-9]{32}$/;

function readEnv(name: string): string {
  return String(process.env[name] ?? "").trim().replace(/^["']|["']$/g, "");
}

function serviceUrl(): string {
  return readEnv("VIDEO_SERVICE_URL").replace(/\/+$/, "");
}

export function isValidJobId(id: string): boolean {
  return JOB_ID.test(id);
}

/** Returns an error response when the caller is not the master admin or the service is not configured. */
export async function guardVideoRequest(req: NextRequest): Promise<NextResponse | null> {
  const session = await requireAdminSession(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!serviceUrl()) {
    return NextResponse.json(
      { error: "VIDEO_SERVICE_URL is not configured on the storefront" },
      { status: 503 },
    );
  }
  return null;
}

export async function videoServiceFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  const token = readEnv("VIDEO_SERVICE_TOKEN");
  if (token) headers.set("Authorization", `Bearer ${token}`);
  return fetch(`${serviceUrl()}${path}`, { ...init, headers, cache: "no-store" });
}

/** Relays a JSON response from the service, normalising FastAPI's {detail} into {error}. */
export async function relayJson(res: Response): Promise<NextResponse> {
  const text = await res.text();
  let data: unknown = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { error: text.slice(0, 300) || `Video service error (${res.status})` };
  }
  if (!res.ok && data && typeof data === "object" && "detail" in data) {
    const detail = (data as { detail: unknown }).detail;
    data = { error: typeof detail === "string" ? detail : "Request rejected by the video service" };
  }
  return NextResponse.json(data, { status: res.status });
}

export function serviceUnreachable(): NextResponse {
  return NextResponse.json({ error: "The video service is unreachable" }, { status: 502 });
}
