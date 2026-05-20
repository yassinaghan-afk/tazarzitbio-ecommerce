import type { Metadata } from "next";

import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { Container, Section } from "@/components/layout/container";

export const metadata: Metadata = {
  title: "لوحة الإدارة",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return (
    <Section spacing="lg" className="bg-secondary/30">
      <Container>
        <AdminDashboard />
      </Container>
    </Section>
  );
}
