/**
 * Live Elite status catalog from GET /v1.0/statuses.
 * Used to resolve delivery_status ID → official Elite status name.
 */

import {
  ELITE_DEFAULT_BASE_URL,
  eliteGetStatuses,
  type EliteStatus,
} from "@/lib/delivery/elite/client";

let cache: { at: number; baseUrl: string; byId: Map<string, EliteStatus> } | null =
  null;
const TTL_MS = 60 * 60 * 1000;

export async function getEliteStatusCatalog(
  baseUrl?: string,
): Promise<Map<string, EliteStatus>> {
  const resolved = (baseUrl || ELITE_DEFAULT_BASE_URL).replace(/\/+$/, "");
  if (
    cache &&
    cache.baseUrl === resolved &&
    Date.now() - cache.at < TTL_MS
  ) {
    return cache.byId;
  }

  const res = await eliteGetStatuses(resolved);
  const byId = new Map<string, EliteStatus>();
  if (res.ok) {
    for (const s of res.data) {
      byId.set(String(s.id), s);
    }
  }
  cache = { at: Date.now(), baseUrl: resolved, byId };
  return byId;
}

export async function resolveEliteStatusName(
  statusId: string | number | undefined | null,
  baseUrl?: string,
): Promise<string | undefined> {
  if (statusId == null || statusId === "") return undefined;
  const catalog = await getEliteStatusCatalog(baseUrl);
  const hit = catalog.get(String(statusId).trim());
  return hit?.name?.replace(/\s*\{\{city\}\}\s*/gi, "").trim() || undefined;
}

export function invalidateEliteStatusCatalog(): void {
  cache = null;
}
