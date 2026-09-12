import type { Metadata } from "next";

import { RoyalUpsellPage } from "@/components/upsell/royal-upsell-page";

export const metadata: Metadata = {
  title: { absolute: "عرض خاص بعد الطلب | Tazarzit Bio" },
  description: "زد منتجات لطلبك بدون مصاريف توصيل إضافية.",
  robots: { index: false, follow: false },
};

export default function UpsellRoutePage() {
  return <RoyalUpsellPage />;
}

export const dynamic = "force-dynamic";
