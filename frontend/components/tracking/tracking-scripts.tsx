"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { usePathname } from "next/navigation";

import { clarityBootstrap, initClarity } from "@/lib/clarity";
import {
  buildMetaPixelBootstrap,
  metaPixelNoscriptSrc,
  primeMetaPixelBootstrap,
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
  buildTikTokPixelBootstrap,
  primeTikTokPixelBootstrap,
} from "@/lib/tiktok-pixel";
import { buildOpenAIPixelBootstrap } from "@/lib/openai-pixel";
import { resolveOpenAIPixelId } from "@/lib/openai/pixel-id";
import { resolveTikTokPixelId } from "@/lib/tiktok/pixel-id";
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
  isPlatformActive,
  isProductionEnvironment,
  resolveTrackingSettings,
} from "@/lib/tracking/settings";
import type { TrackingSettings } from "@/lib/tracking/types";
import { resolveMetaPixelId } from "@/lib/meta/pixel-id";
import { PageViewTracker } from "@/components/tracking/page-view-tracker";

interface TrackingScriptsProps {
  initialSettings?: TrackingSettings;
}

/**
 * Loads marketing pixels once for the storefront.
 * Meta Pixel: official bootstrap (fbevents.js + init + PageView) — single init.
 * TikTok Pixel: official bootstrap (events.js + load + page) — single init.
 * OpenAI Pixel: official bootstrap (oaiq.min.js + init) — single init.
 */
export function TrackingScripts({ initialSettings }: TrackingScriptsProps) {
  const pathname = usePathname();
  const metaPrimed = useRef(false);
  const tiktokPrimed = useRef(false);
  const [settings, setSettings] = useState<TrackingSettings>(() =>
    resolveTrackingSettings(initialSettings ?? undefined),
  );

  useEffect(() => {
    if (initialSettings) {
      const resolved = resolveTrackingSettings(initialSettings);
      setActiveTrackingSettings(resolved);
      setSettings(resolved);
      return;
    }

    let cancelled = false;
    const fallback = resolveTrackingSettings();
    setActiveTrackingSettings(fallback);
    setSettings(fallback);

    void fetch("/api/tracking", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { tracking?: Partial<TrackingSettings> } | null) => {
        if (cancelled) return;
        const resolved = resolveTrackingSettings(data?.tracking);
        if (!resolved.facebook.id) {
          resolved.facebook = {
            id: resolveMetaPixelId(),
            enabled: resolved.facebook.enabled !== false,
          };
        }
        if (!resolved.tiktok.id) {
          resolved.tiktok = {
            id: resolveTikTokPixelId(),
            enabled: resolved.tiktok.enabled !== false,
          };
        }
        setActiveTrackingSettings(resolved);
        setSettings(resolved);
      })
      .catch(() => {
        if (cancelled) return;
        const fallbackSettings = resolveTrackingSettings();
        setActiveTrackingSettings(fallbackSettings);
        setSettings(fallbackSettings);
      });

    return () => {
      cancelled = true;
    };
  }, [initialSettings]);

  // Marketing pixels are storefront-only.
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const allowPixels = isProductionEnvironment() || settings.testMode;
  if (!allowPixels) {
    return null;
  }

  const facebookId = resolveMetaPixelId(settings.facebook.id);
  const loadFacebook =
    facebookId.length > 0 && settings.facebook.enabled !== false;

  // Before paint effects race PageViewTracker: mark bootstrap PageView as already counted.
  if (loadFacebook && !metaPrimed.current) {
    metaPrimed.current = true;
    primeMetaPixelBootstrap();
  }

  const tiktokId = resolveTikTokPixelId(settings.tiktok.id);
  const loadTikTok =
    tiktokId.length > 0 && settings.tiktok.enabled !== false;
  const openaiId = resolveOpenAIPixelId();
  const loadOpenAI = openaiId.length > 0;

  if (loadTikTok && !tiktokPrimed.current) {
    tiktokPrimed.current = true;
    primeTikTokPixelBootstrap();
  }

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
      {loadFacebook && (
        <>
          <Script
            id="facebook-pixel"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: buildMetaPixelBootstrap(facebookId),
            }}
            onReady={() => {
              if (!isScriptLoaded("facebook")) {
                markScriptLoaded("facebook");
                logTrackingScript("Meta", "loaded");
              }
            }}
          />
          <noscript>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              height="1"
              width="1"
              style={{ display: "none" }}
              src={metaPixelNoscriptSrc(facebookId)}
              alt=""
            />
          </noscript>
        </>
      )}

      {gtmId && (
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
              if (!isScriptLoaded("gtm")) {
                markScriptLoaded("gtm");
                initGoogleTagManager(gtmId);
                logTrackingScript("GTM", "loaded");
              }
            }}
          />
        </>
      )}

      {gaId && (
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
              if (!isScriptLoaded("ga4")) {
                markScriptLoaded("ga4");
                initGoogleAnalytics(gaId);
                logTrackingScript("GA4", "loaded");
              }
            }}
          />
        </>
      )}

      {loadTikTok && (
        <Script
          id="tiktok-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: buildTikTokPixelBootstrap(tiktokId),
          }}
          onReady={() => {
            if (!isScriptLoaded("tiktok")) {
              markScriptLoaded("tiktok");
              logTrackingScript("TikTok", "loaded");
            }
          }}
        />
      )}

      {loadOpenAI && (
        <Script
          id="openai-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: buildOpenAIPixelBootstrap(openaiId),
          }}
          onReady={() => {
            if (!isScriptLoaded("openai")) {
              markScriptLoaded("openai");
              logTrackingScript("OpenAI", "loaded");
            }
          }}
        />
      )}

      {snapchatId && (
        <Script
          id="snapchat-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: SNAPCHAT_PIXEL_BOOTSTRAP }}
          onReady={() => {
            if (!isScriptLoaded("snapchat")) {
              markScriptLoaded("snapchat");
              initSnapchatPixel(snapchatId);
              logTrackingScript("Snapchat", "loaded");
            }
          }}
        />
      )}

      {clarityId && (
        <Script
          id="microsoft-clarity"
          strategy="lazyOnload"
          dangerouslySetInnerHTML={{
            __html: clarityBootstrap(clarityId),
          }}
          onReady={() => {
            if (!isScriptLoaded("clarity")) {
              markScriptLoaded("clarity");
              initClarity(clarityId);
              logTrackingScript("Clarity", "loaded");
            }
          }}
        />
      )}

      <PageViewTracker />
    </>
  );
}
