import { ATTRIBUTION_COOKIE, type StoredAttribution } from "@/lib/tracking/attribution";
import type { OrderAttribution } from "@/lib/orders/types";

function readCookies(header: string | null): Map<string, string> {
  const map = new Map<string, string>();
  if (!header) return map;
  for (const part of header.split(";")) {
    const idx = part.indexOf("=");
    if (idx < 0) continue;
    const name = part.slice(0, idx).trim();
    const value = part.slice(idx + 1).trim();
    if (name) map.set(name, value);
  }
  return map;
}

/** `_gcl_aw` / `_gcl_gb` look like `GCL.<timestamp>.<click id>`. */
function gclClickId(raw?: string): string {
  if (!raw) return "";
  const parts = decodeURIComponent(raw).split(".");
  return parts.length >= 3 ? parts.slice(2).join(".") : "";
}

function parseStored(raw?: string): StoredAttribution {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(decodeURIComponent(raw)) as unknown;
    return parsed && typeof parsed === "object" ? (parsed as StoredAttribution) : {};
  } catch {
    return {};
  }
}

function channelOf(a: StoredAttribution & { gclid?: string; gbraid?: string }): string {
  if (a.gclid || a.gbraid || a.wbraid) return "Google Ads";
  if (a.fbclid) return "Facebook / Instagram";
  if (a.ttclid) return "TikTok";
  if (a.utm_source) return a.utm_source;
  return "Direct";
}

/** Order source from the visitor's first-party cookies (never throws). */
export function attributionFromCookies(cookieHeader: string | null): OrderAttribution {
  const cookies = readCookies(cookieHeader);
  const stored = parseStored(cookies.get(ATTRIBUTION_COOKIE));
  const gclid = stored.gclid || gclClickId(cookies.get("_gcl_aw"));
  const gbraid = stored.gbraid || gclClickId(cookies.get("_gcl_gb"));

  const merged = { ...stored, gclid, gbraid };
  const result: OrderAttribution = { channel: channelOf(merged) };
  if (gclid) result.gclid = gclid;
  if (gbraid) result.gbraid = gbraid;
  if (stored.wbraid) result.wbraid = stored.wbraid;
  if (stored.fbclid) result.fbclid = stored.fbclid;
  if (stored.ttclid) result.ttclid = stored.ttclid;
  if (stored.utm_source) result.utmSource = stored.utm_source;
  if (stored.utm_medium) result.utmMedium = stored.utm_medium;
  if (stored.utm_campaign) result.utmCampaign = stored.utm_campaign;
  if (stored.landing) result.landingPage = stored.landing;
  return result;
}
