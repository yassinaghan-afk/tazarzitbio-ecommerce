import { trackingConfig } from "@/lib/tracking-config";
import type {
  LegacyTrackingSettings,
  TrackingPlatformConfig,
  TrackingPlatformKey,
  TrackingSettings,
} from "@/lib/tracking/types";

function platform(id: string, enabled = true): TrackingPlatformConfig {
  const trimmed = id.trim();
  return { id: trimmed, enabled: enabled && trimmed.length > 0 };
}

export const DEFAULT_TRACKING_SETTINGS: TrackingSettings = {
  facebook: platform(trackingConfig.facebookPixelId),
  tiktok: platform(trackingConfig.tiktokPixelId),
  snapchat: platform(trackingConfig.snapchatPixelId),
  googleAnalytics: platform(trackingConfig.googleAnalyticsId),
  googleTagManager: platform(trackingConfig.googleTagManagerId),
  microsoftClarity: platform(trackingConfig.microsoftClarityId),
  testMode: false,
};

function isNewFormat(raw: unknown): raw is TrackingSettings {
  return (
    typeof raw === "object" &&
    raw !== null &&
    "facebook" in raw &&
    typeof (raw as TrackingSettings).facebook === "object"
  );
}

function migrateLegacy(raw: LegacyTrackingSettings): TrackingSettings {
  const id = (v: unknown) => (typeof v === "string" ? v.trim() : "");
  const on = (v: unknown, fallbackId: string) =>
    typeof v === "boolean" ? v : fallbackId.length > 0;

  return {
    facebook: {
      id: id(raw.facebookPixelId),
      enabled: on(raw.facebookEnabled, id(raw.facebookPixelId)),
    },
    tiktok: {
      id: id(raw.tiktokPixelId),
      enabled: on(raw.tiktokEnabled, id(raw.tiktokPixelId)),
    },
    snapchat: {
      id: id(raw.snapchatPixelId),
      enabled: on(raw.snapchatEnabled, id(raw.snapchatPixelId)),
    },
    googleAnalytics: {
      id: id(raw.googleAnalyticsId),
      enabled: on(raw.googleAnalyticsEnabled, id(raw.googleAnalyticsId)),
    },
    googleTagManager: {
      id: id(raw.googleTagManagerId),
      enabled: on(raw.googleTagManagerEnabled, id(raw.googleTagManagerId)),
    },
    microsoftClarity: {
      id: id(raw.microsoftClarityId),
      enabled: on(raw.microsoftClarityEnabled, id(raw.microsoftClarityId)),
    },
    testMode: Boolean(raw.testMode),
  };
}

function normalizePlatform(
  raw: Partial<TrackingPlatformConfig> | undefined,
  fallback: TrackingPlatformConfig,
): TrackingPlatformConfig {
  const id = typeof raw?.id === "string" ? raw.id.trim() : fallback.id;
  const enabled =
    typeof raw?.enabled === "boolean" ? raw.enabled : fallback.enabled;
  return {
    id,
    enabled: enabled && id.length > 0,
  };
}

/** Strip whitespace; disable platform when ID is empty. */
export function normalizeTrackingSettings(
  raw?: Partial<TrackingSettings> | LegacyTrackingSettings | null,
): TrackingSettings {
  if (!raw) return { ...DEFAULT_TRACKING_SETTINGS };

  const base = isNewFormat(raw)
    ? raw
    : migrateLegacy(raw as LegacyTrackingSettings);

  return {
    facebook: normalizePlatform(base.facebook, DEFAULT_TRACKING_SETTINGS.facebook),
    tiktok: normalizePlatform(base.tiktok, DEFAULT_TRACKING_SETTINGS.tiktok),
    snapchat: normalizePlatform(base.snapchat, DEFAULT_TRACKING_SETTINGS.snapchat),
    googleAnalytics: normalizePlatform(
      base.googleAnalytics,
      DEFAULT_TRACKING_SETTINGS.googleAnalytics,
    ),
    googleTagManager: normalizePlatform(
      base.googleTagManager,
      DEFAULT_TRACKING_SETTINGS.googleTagManager,
    ),
    microsoftClarity: normalizePlatform(
      base.microsoftClarity,
      DEFAULT_TRACKING_SETTINGS.microsoftClarity,
    ),
    testMode: Boolean(base.testMode),
  };
}

function mergePlatform(
  saved: TrackingPlatformConfig,
  env: TrackingPlatformConfig,
): TrackingPlatformConfig {
  const id = saved.id || env.id;
  if (!id) return { id: "", enabled: false };
  const enabled = saved.id ? saved.enabled : env.enabled;
  return { id, enabled: enabled && id.length > 0 };
}

/** Admin-saved IDs override env defaults when non-empty. */
export function resolveTrackingSettings(
  stored?: Partial<TrackingSettings> | LegacyTrackingSettings | null,
): TrackingSettings {
  const env = normalizeTrackingSettings(DEFAULT_TRACKING_SETTINGS);
  if (!stored) return env;
  const saved = normalizeTrackingSettings(stored);
  return {
    facebook: mergePlatform(saved.facebook, env.facebook),
    tiktok: mergePlatform(saved.tiktok, env.tiktok),
    snapchat: mergePlatform(saved.snapchat, env.snapchat),
    googleAnalytics: mergePlatform(saved.googleAnalytics, env.googleAnalytics),
    googleTagManager: mergePlatform(saved.googleTagManager, env.googleTagManager),
    microsoftClarity: mergePlatform(saved.microsoftClarity, env.microsoftClarity),
    testMode: saved.testMode,
  };
}

export function isPlatformActive(
  settings: TrackingSettings,
  key: TrackingPlatformKey,
): boolean {
  const platform = settings[key];
  return platform.enabled && platform.id.length > 0;
}

export function countActivePlatforms(settings: TrackingSettings): number {
  const keys: TrackingPlatformKey[] = [
    "facebook",
    "tiktok",
    "snapchat",
    "googleAnalytics",
    "googleTagManager",
    "microsoftClarity",
  ];
  return keys.filter((k) => isPlatformActive(settings, k)).length;
}

export function hasAnyActivePlatform(settings: TrackingSettings): boolean {
  return countActivePlatforms(settings) > 0;
}

export function isProductionEnvironment(): boolean {
  return process.env.NODE_ENV === "production";
}

/** Scripts load only in production when at least one platform is active. */
export function shouldInjectTrackingScripts(settings: TrackingSettings): boolean {
  return isProductionEnvironment() && hasAnyActivePlatform(settings);
}
