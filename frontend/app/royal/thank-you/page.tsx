import type { Metadata } from "next";

import { RoyalThankYouClient } from "@/components/royal/royal-thank-you-client";
import { AMLOU_ROYAL_CANONICAL } from "@/lib/products/amlou-royal";

export const metadata: Metadata = {
  title: { absolute: "شكراً على طلبك | أملو ملكي" },
  description: "توصلنا بالطلب ديالك بنجاح. غادي نتاصلو بيك قريباً لتأكيد الطلب.",
  robots: { index: false, follow: false },
  alternates: {
    canonical: `${AMLOU_ROYAL_CANONICAL}/thank-you`,
  },
};

export default function RoyalThankYouPage() {
  return <RoyalThankYouClient />;
}

export const dynamic = "force-dynamic";
