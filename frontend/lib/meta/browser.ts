/**
 * Client-safe Meta matching cookie helpers + event IDs.
 * No secrets — only public cookies set by the Meta Pixel.
 */

export function createMetaEventId(prefix = "ev"): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}_${crypto.randomUUID().replace(/-/g, "").slice(0, 24)}`;
  }
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 12)}`;
}

function readCookie(name: string): string {
  if (typeof document === "undefined") return "";
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}=([^;]*)`),
  );
  return match ? decodeURIComponent(match[1]) : "";
}

/** Meta browser cookie `_fbp` for matching. */
export function getMetaFbp(): string {
  return readCookie("_fbp");
}

/**
 * Meta click id cookie `_fbc`, or synthesize from `fbclid` query param when present.
 */
export function getMetaFbc(): string {
  const existing = readCookie("_fbc");
  if (existing) return existing;
  if (typeof window === "undefined") return "";
  try {
    const fbclid = new URLSearchParams(window.location.search).get("fbclid");
    if (!fbclid) return "";
    return `fb.1.${Date.now()}.${fbclid}`;
  } catch {
    return "";
  }
}

export function getMetaBrowserIds(): { fbp?: string; fbc?: string } {
  const fbp = getMetaFbp();
  const fbc = getMetaFbc();
  return {
    ...(fbp ? { fbp } : {}),
    ...(fbc ? { fbc } : {}),
  };
}
