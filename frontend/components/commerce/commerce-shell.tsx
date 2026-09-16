"use client";

import type { ReactNode } from "react";

import { CartDrawer } from "@/components/cart/cart-drawer";
import { CheckoutDrawer } from "@/components/cart/checkout-drawer";
import { LanguageProvider } from "@/lib/i18n/language-provider";
import type { Language } from "@/lib/i18n/types";
import { CommerceProvider } from "@/components/providers/commerce-provider";
import { TrackingRoot } from "@/components/tracking/tracking-root";

export function CommerceShell({
  children,
  initialLocale,
}: {
  children: ReactNode;
  initialLocale?: Language;
}) {
  return (
    <LanguageProvider initialLocale={initialLocale}>
    <CommerceProvider>
      <div className="max-w-full overflow-x-hidden">
        <TrackingRoot />
        {children}
      </div>
      <CartDrawer />
      <CheckoutDrawer />
    </CommerceProvider>
    </LanguageProvider>
  );
}
