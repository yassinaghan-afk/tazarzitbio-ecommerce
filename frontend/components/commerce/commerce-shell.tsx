"use client";

import type { ReactNode } from "react";

import { CartDrawer } from "@/components/cart/cart-drawer";
import { CheckoutDrawer } from "@/components/cart/checkout-drawer";
import { LanguageProvider } from "@/lib/i18n/language-provider";
import { CommerceProvider } from "@/components/providers/commerce-provider";
import { TrackingRoot } from "@/components/tracking/tracking-root";

export function CommerceShell({ children }: { children: ReactNode }) {
  return (
    <LanguageProvider>
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
