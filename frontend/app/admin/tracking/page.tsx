import type { Metadata } from "next";

import { TrackingSettingsManager } from "@/components/admin/tracking-settings-manager";

export const metadata: Metadata = {
  title: "Tracking Settings",
  robots: { index: false, follow: false },
};

export default function AdminTrackingPage() {
  return (
    <div className="min-h-dvh bg-background px-4 py-8 md:px-6">
      <div className="mx-auto max-w-5xl">
        <TrackingSettingsManager showBackLink />
      </div>
    </div>
  );
}
