import type { TrackingPlatformKey, TrackingSettings } from "@/lib/tracking/types";
import {
  DEFAULT_TRACKING_SETTINGS,
  isPlatformActive,
} from "@/lib/tracking/settings";

/** Client-side effective config after /api/tracking fetch. */
let activeSettings: TrackingSettings = { ...DEFAULT_TRACKING_SETTINGS };
let settingsReady = false;

export function setActiveTrackingSettings(settings: TrackingSettings): void {
  activeSettings = settings;
  settingsReady = true;
}

export function getActiveTrackingSettings(): TrackingSettings {
  return activeSettings;
}

export function isTrackingSettingsReady(): boolean {
  return settingsReady;
}

export function isTrackingPlatformActive(key: TrackingPlatformKey): boolean {
  return isPlatformActive(activeSettings, key);
}

/** Prevent duplicate script injection across hot reloads. */
const loadedScripts = new Set<string>();

export function markScriptLoaded(key: string): void {
  loadedScripts.add(key);
}

export function isScriptLoaded(key: string): boolean {
  return loadedScripts.has(key);
}
