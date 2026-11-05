/**
 * Last non-direct touch attribution, stored in a first-party cookie so the
 * order API can read it server-side without changing every checkout payload.
 */

export const ATTRIBUTION_COOKIE = "tz_attr";

const MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

const PARAM_KEYS = [
  "gclid",
  "gbraid",
  "wbraid",
  "fbclid",
  "ttclid",
  "utm_source",
  "utm_medium",
  "utm_campaign",
] as const;

type ParamKey = (typeof PARAM_KEYS)[number];

export type StoredAttribution = Partial<Record<ParamKey, string>> & {
  landing?: string;
  ts?: number;
};

export function captureAttribution(): void {
  if (typeof window === "undefined") return;
  let params: URLSearchParams;
  try {
    params = new URLSearchParams(window.location.search);
  } catch {
    return;
  }

  const found: StoredAttribution = {};
  for (const key of PARAM_KEYS) {
    const value = params.get(key)?.trim();
    if (value) found[key] = value.slice(0, 200);
  }
  if (Object.keys(found).length === 0) return;

  found.landing = window.location.pathname.slice(0, 120);
  found.ts = Date.now();

  const value = encodeURIComponent(JSON.stringify(found));
  document.cookie = `${ATTRIBUTION_COOKIE}=${value}; Max-Age=${MAX_AGE_SECONDS}; Path=/; SameSite=Lax${
    window.location.protocol === "https:" ? "; Secure" : ""
  }`;
}
