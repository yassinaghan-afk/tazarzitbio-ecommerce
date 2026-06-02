"use client";

import { Suspense } from "react";

import { TrackingScripts } from "@/components/tracking/tracking-scripts";

/** Client-only tracking shell — wrapped in Suspense for useSearchParams. */
export function TrackingRoot() {
  return (
    <Suspense fallback={null}>
      <TrackingScripts />
    </Suspense>
  );
}
