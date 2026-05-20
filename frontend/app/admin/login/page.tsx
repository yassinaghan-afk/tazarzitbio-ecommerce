import type { Metadata } from "next";

import { AdminLoginClient } from "@/components/admin/admin-login-client";
import { Container, Section } from "@/components/layout/container";

export const metadata: Metadata = {
  title: "تسجيل دخول الإدارة",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <Section spacing="lg" className="texture-grain">
      <Container className="max-w-md">
        <AdminLoginClient />
      </Container>
    </Section>
  );
}

