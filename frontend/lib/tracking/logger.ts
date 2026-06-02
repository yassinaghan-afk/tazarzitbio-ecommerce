import { getActiveTrackingSettings } from "@/lib/tracking/runtime";

const LOG_PREFIX = "[Tazarzit Tracking]";

export function isTrackingTestMode(): boolean {
  return getActiveTrackingSettings().testMode;
}

export function logTracking(
  event: string,
  payload?: unknown,
  platform?: string,
): void {
  if (!isTrackingTestMode()) return;
  if (typeof window === "undefined") return;

  const label = platform ? `${LOG_PREFIX} ${platform}` : LOG_PREFIX;
  if (payload !== undefined) {
    console.info(label, event, payload);
  } else {
    console.info(label, event);
  }
}

export function logTrackingScript(platform: string, action: string): void {
  if (!isTrackingTestMode()) return;
  console.info(`${LOG_PREFIX} script`, platform, action);
}
