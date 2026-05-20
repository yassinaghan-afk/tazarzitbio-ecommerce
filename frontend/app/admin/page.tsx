import type { Metadata } from "next";

import { PricingDashboard } from "@/components/admin/pricing-dashboard";
import { ShippingSettingsForm } from "@/components/admin/shipping-settings-form";
import { Container, Section } from "@/components/layout/container";

export const metadata: Metadata = {
  title: "لوحة التسعير",
  robots: { index: false, follow: false },
};

export default function AdminPricingPage() {
  return (
    <Section spacing="lg" className="bg-secondary/30">
      <Container>
        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-wider text-accent">
            إدارة تازارزيت بيو
          </p>
          <h1 className="text-display mt-2 text-3xl text-foreground">
            لوحة التسعير والأرباح
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            عدّل تكلفة الشراء وسعر البيع وتقديرات التوصيل والإعلانات. يظهر سعر
            البيع فقط للزوار على الموقع.
          </p>
        </div>
        <div className="space-y-10">
          <ShippingSettingsForm />
          <PricingDashboard />
        </div>
      </Container>
    </Section>
  );
}
