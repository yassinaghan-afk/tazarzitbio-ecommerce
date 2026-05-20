"use client";

import { useCallback, useEffect, useState } from "react";

import {
  DEFAULT_ANNOUNCEMENT_BAR,
  normalizeAnnouncementBar,
  type AnnouncementBarConfig,
} from "@/lib/admin/announcement-bar";

async function fetchAnnouncementBar(): Promise<AnnouncementBarConfig> {
  try {
    const res = await fetch("/api/announcement-bar", { cache: "no-store" });
    if (!res.ok) return DEFAULT_ANNOUNCEMENT_BAR;
    const data = (await res.json()) as { announcementBar?: AnnouncementBarConfig };
    return normalizeAnnouncementBar(data.announcementBar);
  } catch {
    return DEFAULT_ANNOUNCEMENT_BAR;
  }
}

export function useAnnouncementBar(): AnnouncementBarConfig {
  const [config, setConfig] = useState<AnnouncementBarConfig>(
    DEFAULT_ANNOUNCEMENT_BAR,
  );

  const refresh = useCallback(() => {
    void fetchAnnouncementBar().then(setConfig);
  }, []);

  useEffect(() => {
    refresh();
    const onUpdate = () => refresh();
    window.addEventListener("tazarzit-announcement-updated", onUpdate);
    window.addEventListener("storage", onUpdate);
    return () => {
      window.removeEventListener("tazarzit-announcement-updated", onUpdate);
      window.removeEventListener("storage", onUpdate);
    };
  }, [refresh]);

  return config;
}
