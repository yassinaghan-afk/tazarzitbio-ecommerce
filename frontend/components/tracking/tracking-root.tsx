"use client";

import { Suspense } from "react";

import { AttributionCapture } from "@/components/tracking/attribution-capture";
import { TrackingScripts } from "@/components/tracking/tracking-scripts";

/** Client-only tracking shell — wrapped in Suspense for useSearchParams. */
export function TrackingRoot() {
  return (
    <Suspense fallback={null}>
      <AttributionCapture />
      <TrackingScripts />
    </Suspense>
  );
}
