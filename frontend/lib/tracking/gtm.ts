import { getActiveTrackingSettings, isTrackingPlatformActive } from "@/lib/tracking/runtime";

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

let initialized = false;

function getContainerId(): string {
  if (!isTrackingPlatformActive("googleTagManager")) return "";
  return getActiveTrackingSettings().googleTagManager.id;
}

export function initGoogleTagManager(containerId?: string): void {
  const id = containerId ?? getContainerId();
  if (!id || initialized) return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    "gtm.start": Date.now(),
    event: "gtm.js",
  });
  initialized = true;
}

export function isGtmEnabled(): boolean {
  return getContainerId().length > 0;
}

/** GTM head snippet — noscript iframe is rendered separately in TrackingScripts. */
export function gtmScriptSrc(containerId: string): string {
  return `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(containerId)}`;
}

export const GTM_BOOTSTRAP = `
window.dataLayer = window.dataLayer || [];
`;
