"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Gift,
  Leaf,
  Package,
  Phone,
  ShieldCheck,
  Truck,
  type LucideIcon,
} from "lucide-react";

import {
  ANNOUNCEMENT_BAR_HEIGHT_PX,
  getActiveAnnouncementMessages,
  type AnnouncementIcon,
} from "@/lib/admin/announcement-bar";
import {
  HEADER_HEIGHT_DESKTOP_PX,
  HEADER_HEIGHT_MOBILE_PX,
} from "@/lib/brand";
import { useAnnouncementBar } from "@/hooks/use-announcement-bar";
import { cn } from "@/lib/utils";

const ICON_MAP: Record<AnnouncementIcon, LucideIcon> = {
  truck: Truck,
  shield: ShieldCheck,
  package: Package,
  gift: Gift,
  leaf: Leaf,
  phone: Phone,
};

export function AnnouncementBar() {
  const config = useAnnouncementBar();
  const messages = useMemo(
    () => getActiveAnnouncementMessages(config),
    [config],
  );
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const visible = config.isEnabled && messages.length > 0;
  const current = messages[index] ?? messages[0];
  const Icon = current ? ICON_MAP[current.icon] ?? Truck : Truck;

  useEffect(() => {
    const root = document.documentElement;
    const headerHeight = window.matchMedia("(min-width: 1024px)").matches
      ? HEADER_HEIGHT_DESKTOP_PX
      : HEADER_HEIGHT_MOBILE_PX;
    const announcementHeight = visible ? ANNOUNCEMENT_BAR_HEIGHT_PX : 0;

    root.style.setProperty("--header-height", `${headerHeight}px`);
    root.style.setProperty(
      "--announcement-height",
      `${announcementHeight}px`,
    );
    root.style.setProperty(
      "--site-top-offset",
      `${headerHeight + announcementHeight}px`,
    );

    return () => {
      root.style.setProperty("--announcement-height", "0px");
      root.style.setProperty("--site-top-offset", `${headerHeight}px`);
    };
  }, [visible]);

  useEffect(() => {
    if (!visible || messages.length <= 1 || paused) return;

    const interval = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % messages.length);
    }, config.rotationIntervalMs);

    return () => window.clearInterval(interval);
  }, [visible, messages.length, config.rotationIntervalMs, paused]);

  useEffect(() => {
    if (index >= messages.length) setIndex(0);
  }, [index, messages.length]);

  if (!visible || !current) return null;

  return (
    <div
      className="fixed inset-x-0 top-[var(--header-height,5.75rem)] z-40 border-b border-white/10 bg-[hsl(96_33%_18%)] shadow-sm"
      style={{ height: ANNOUNCEMENT_BAR_HEIGHT_PX }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      role="region"
      aria-label="إعلانات تازارزيت بيو"
      aria-live="polite"
    >
      <div className="mx-auto flex h-full w-full max-w-7xl min-w-0 items-center justify-center px-4 sm:px-6 lg:px-8">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={current.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="flex w-full items-center justify-center gap-2 text-center"
          >
            <Icon
              className={cn(
                "size-3.5 shrink-0 text-[hsl(42_55%_78%)] sm:size-4",
              )}
              strokeWidth={2}
              aria-hidden
            />
            <p className="truncate text-[0.7rem] font-semibold leading-tight text-[hsl(42_42%_96%)] sm:text-xs sm:leading-snug">
              {current.text}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
