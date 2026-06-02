"use client";

import { useEffect, useState } from "react";
import Script from "next/script";

import { clarityBootstrap, initClarity } from "@/lib/clarity";
import {
  FACEBOOK_PIXEL_BOOTSTRAP,
  initFacebookPixel,
} from "@/lib/facebook-pixel";
import {
  GA4_BOOTSTRAP,
  ga4ScriptSrc,
  initGoogleAnalytics,
} from "@/lib/google-analytics";
import {
  SNAPCHAT_PIXEL_BOOTSTRAP,
  initSnapchatPixel,
} from "@/lib/snapchat-pixel";
import {
  TIKTOK_PIXEL_BOOTSTRAP,
  initTikTokPixel,
} from "@/lib/tiktok-pixel";
import {
  GTM_BOOTSTRAP,
  gtmScriptSrc,
  initGoogleTagManager,
} from "@/lib/tracking/gtm";
import { logTrackingScript } from "@/lib/tracking/logger";
import {
  isScriptLoaded,
  markScriptLoaded,
  setActiveTrackingSettings,
} from "@/lib/tracking/runtime";
import {
  hasAnyActivePlatform,
  isPlatformActive,
  resolveTrackingSettings,
  shouldInjectTrackingScripts,
} from "@/lib/tracking/settings";
import type { TrackingSettings } from "@/lib/tracking/types";
import { PageViewTracker } from "@/components/tracking/page-view-tracker";

interface TrackingScriptsProps {
  initialSettings?: TrackingSettings;
}

/**
 * Loads marketing pixels client-side only in production.
 * Scripts inject once per platform — no duplicates on navigation.
 */
export function TrackingScripts({ initialSettings }: TrackingScriptsProps) {
  const [settings, setSettings] = useState<TrackingSettings | null>(
    initialSettings ?? null,
  );
  const [ready, setReady] = useState(Boolean(initialSettings));

  useEffect(() => {
    if (initialSettings) {
      setActiveTrackingSettings(initialSettings);
      setReady(true);
      return;
    }

    let cancelled = false;
    void fetch("/api/tracking", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { tracking?: Partial<TrackingSettings> } | null) => {
        if (cancelled) return;
        const resolved = resolveTrackingSettings(data?.tracking);
        setActiveTrackingSettings(resolved);
        setSettings(resolved);
        setReady(true);
      })
      .catch(() => {
        if (cancelled) return;
        const fallback = resolveTrackingSettings();
        setActiveTrackingSettings(fallback);
        setSettings(fallback);
        setReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, [initialSettings]);

  if (!ready || !settings) {
    return null;
  }

  const shouldTrack =
    settings.testMode || hasAnyActivePlatform(settings);
  if (!shouldTrack) {
    return null;
  }

  const injectScripts = shouldInjectTrackingScripts(settings);

  const facebookId = isPlatformActive(settings, "facebook")
    ? settings.facebook.id
    : "";
  const tiktokId = isPlatformActive(settings, "tiktok")
    ? settings.tiktok.id
    : "";
  const snapchatId = isPlatformActive(settings, "snapchat")
    ? settings.snapchat.id
    : "";
  const gaId = isPlatformActive(settings, "googleAnalytics")
    ? settings.googleAnalytics.id
    : "";
  const gtmId = isPlatformActive(settings, "googleTagManager")
    ? settings.googleTagManager.id
    : "";
  const clarityId = isPlatformActive(settings, "microsoftClarity")
    ? settings.microsoftClarity.id
    : "";

  return (
    <>
      {injectScripts && (
        <>
          {gtmId && !isScriptLoaded("gtm") && (
            <>
              <Script
                id="gtm-bootstrap"
                strategy="afterInteractive"
                dangerouslySetInnerHTML={{ __html: GTM_BOOTSTRAP }}
              />
              <Script
                id="gtm-script"
                strategy="afterInteractive"
                src={gtmScriptSrc(gtmId)}
                onLoad={() => {
                  markScriptLoaded("gtm");
                  initGoogleTagManager(gtmId);
                  logTrackingScript("GTM", "loaded");
                }}
              />
            </>
          )}

          {gaId && !isScriptLoaded("ga4") && (
            <>
              <Script
                id="ga4-bootstrap"
                strategy="afterInteractive"
                dangerouslySetInnerHTML={{ __html: GA4_BOOTSTRAP }}
              />
              <Script
                id="ga4-script"
                strategy="afterInteractive"
                src={ga4ScriptSrc(gaId)}
                onLoad={() => {
                  markScriptLoaded("ga4");
                  initGoogleAnalytics(gaId);
                  logTrackingScript("GA4", "loaded");
                }}
              />
            </>
          )}

          {facebookId && !isScriptLoaded("facebook") && (
            <Script
              id="facebook-pixel"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{ __html: FACEBOOK_PIXEL_BOOTSTRAP }}
              onReady={() => {
                markScriptLoaded("facebook");
                initFacebookPixel(facebookId);
                logTrackingScript("Meta", "loaded");
              }}
            />
          )}

          {tiktokId && !isScriptLoaded("tiktok") && (
            <Script
              id="tiktok-pixel"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{ __html: TIKTOK_PIXEL_BOOTSTRAP }}
              onReady={() => {
                markScriptLoaded("tiktok");
                initTikTokPixel(tiktokId);
                logTrackingScript("TikTok", "loaded");
              }}
            />
          )}

          {snapchatId && !isScriptLoaded("snapchat") && (
            <Script
              id="snapchat-pixel"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{ __html: SNAPCHAT_PIXEL_BOOTSTRAP }}
              onReady={() => {
                markScriptLoaded("snapchat");
                initSnapchatPixel(snapchatId);
                logTrackingScript("Snapchat", "loaded");
              }}
            />
          )}

          {clarityId && !isScriptLoaded("clarity") && (
            <Script
              id="microsoft-clarity"
              strategy="lazyOnload"
              dangerouslySetInnerHTML={{
                __html: clarityBootstrap(clarityId),
              }}
              onReady={() => {
                markScriptLoaded("clarity");
                initClarity(clarityId);
                logTrackingScript("Clarity", "loaded");
              }}
            />
          )}
        </>
      )}

      <PageViewTracker />
    </>
  );
}
