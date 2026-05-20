"use client";

import { HoneyUpsellSection } from "@/components/checkout/honey-upsell-section";
import type { PublicProduct } from "@/lib/products/types";

interface CheckoutCrossSellProps {
  products: PublicProduct[];
}

export function CheckoutCrossSell({ products }: CheckoutCrossSellProps) {
  return (
    <HoneyUpsellSection
      products={products}
      layout="inline"
      compact
      className="border-accent/20"
    />
  );
}
