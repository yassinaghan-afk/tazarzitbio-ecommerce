import type { Metadata, Viewport } from "next";
import { Tajawal } from "next/font/google";

import "./globals.css";

const tajawal = Tajawal({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "700", "800"],
  variable: "--font-tajawal",
  display: "swap",
  preload: true,
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: {
    default: "تازارزيت بيو | 100% طبيعي من قلب سوس",
    template: "%s | تازارزيت بيو",
  },
  description:
    "منتجات مغربية طبيعية فاخرة — أملو، زيت أركان، عسل، ومكسرات مختارة من سوس. الدفع عند الاستلام في جميع أنحاء المغرب.",
  keywords: ["أملو", "زيت أركان", "عسل طبيعي", "سوس", "منتجات طبيعية المغرب", "تازارزيت بيو"],
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ),
  openGraph: {
    type: "website",
    locale: "ar_MA",
    title: "تازارزيت بيو | 100% طبيعي من قلب سوس",
    description:
      "أملو، زيت أركان، عسل، ومكسرات مختارة من سوس — الدفع عند الاستلام.",
  },
  icons: {
    icon: "/brand/tazarzitbio-logo.png",
    apple: "/brand/tazarzitbio-logo.png",
  },
  other: {
    "msapplication-TileColor": "#C8922A",
  },
};

/**
 * Minimal root layout — NO storefront chrome.
 * Public pages use (storefront)/layout.tsx.
 * Admin pages use admin/layout.tsx.
 */
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={tajawal.variable}
      suppressHydrationWarning
    >
      <body className="min-h-screen max-w-full overflow-x-hidden font-sans selection:bg-accent/20">
        {children}
      </body>
    </html>
  );
}
