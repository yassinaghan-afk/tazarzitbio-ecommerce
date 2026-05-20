"use client";

import { Truck } from "lucide-react";

import { useCommerce } from "@/components/providers/commerce-provider";
import { DEFAULT_SHIPPING_SETTINGS } from "@/lib/shipping/settings";
import { cn } from "@/lib/utils";

interface ShippingPromoBannerProps {
  className?: string;
}

export function ShippingPromoBanner({ className }: ShippingPromoBannerProps) {
  const { shipping } = useCommerce();
  const min = DEFAULT_SHIPPING_SETTINGS.freeShippingMinimumProducts;
  const amount = DEFAULT_SHIPPING_SETTINGS.freeShippingMinimumAmount;

  if (shipping.isFreeShipping && shipping.productCount > 0) {
    return (
      <div
        className={cn(
          "flex items-start gap-2 rounded-xl border border-emerald-200/80 bg-emerald-50/80 px-3 py-2.5 text-xs",
          className,
        )}
      >
        <Truck className="mt-0.5 size-4 shrink-0 text-emerald-600" />
        <div>
          <p className="font-semibold text-emerald-800">Livraison gratuite</p>
          <p className="text-emerald-700/90">توصيل مجاني على طلبك الحالي</p>
        </div>
      </div>
    );
  }

  if (shipping.upsellMessageFr) {
    return (
      <div
        className={cn(
          "rounded-xl border border-dashed border-accent/35 bg-accent/5 px-3 py-2.5 text-xs",
          className,
        )}
      >
        <p className="font-medium text-foreground">{shipping.upsellMessageFr}</p>
        {shipping.upsellMessageAr && (
          <p className="mt-1 text-muted-foreground">{shipping.upsellMessageAr}</p>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-start gap-2 rounded-xl bg-secondary/60 px-3 py-2.5 text-xs text-muted-foreground",
        className,
      )}
    >
      <Truck className="mt-0.5 size-4 shrink-0 text-accent" />
      <p>
        توصيل مجاني من {amount} د.م. أو {min} منتجات — رسوم ثابتة{" "}
        {DEFAULT_SHIPPING_SETTINGS.defaultShippingPrice} د.م. لكل طلب.
      </p>
    </div>
  );
}
