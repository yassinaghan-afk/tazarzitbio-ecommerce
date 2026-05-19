"use client";

import type { ReactNode } from "react";

import { CartDrawer } from "@/components/cart/cart-drawer";
import { CheckoutDrawer } from "@/components/cart/checkout-drawer";
import { CommerceProvider } from "@/components/providers/commerce-provider";

export function CommerceShell({ children }: { children: ReactNode }) {
  return (
    <CommerceProvider>
      {children}
      <CartDrawer />
      <CheckoutDrawer />
    </CommerceProvider>
  );
}
