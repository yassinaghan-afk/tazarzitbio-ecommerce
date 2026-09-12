import type { Metadata } from "next";

import { AdminThemeProvider } from "@/components/admin/admin-theme-provider";

export const metadata: Metadata = {
  title: {
    default: "Admin | TazarzitBio",
    template: "%s | Admin TazarzitBio",
  },
  robots: { index: false, follow: false },
};

/**
 * Isolated Admin layout — no storefront header/footer/cart/tracking chrome.
 */
export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <AdminThemeProvider>{children}</AdminThemeProvider>;
}
