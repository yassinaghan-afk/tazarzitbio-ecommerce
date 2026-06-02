"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

import { trackPageView } from "@/lib/tracking/events";

/**
 * Tracks SPA route changes without duplicate initial PageView.
 * Waits one tick so pixel init scripts can finish loading.
 */
export function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isFirst = useRef(true);

  useEffect(() => {
    const query = searchParams.toString();
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}${pathname}${query ? `?${query}` : ""}`
        : pathname;

    const fire = () => trackPageView(url);

    if (isFirst.current) {
      isFirst.current = false;
      // Delay first pageview so pixel init onLoad handlers can run first.
      const timer = window.setTimeout(fire, 300);
      return () => window.clearTimeout(timer);
    }

    fire();
  }, [pathname, searchParams]);

  return null;
}
