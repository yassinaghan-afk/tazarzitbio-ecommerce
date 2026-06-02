import type { Metadata } from "next";

import { TrackingSettingsManager } from "@/components/admin/tracking-settings-manager";
import { Container, Section } from "@/components/layout/container";

export const metadata: Metadata = {
  title: "إعدادات التتبع",
  robots: { index: false, follow: false },
};

export default function AdminTrackingPage() {
  return (
    <Section spacing="lg" className="bg-secondary/30 min-h-screen">
      <Container className="max-w-5xl">
        <TrackingSettingsManager showBackLink />
      </Container>
    </Section>
  );
}
