"use client";

import { Truck } from "lucide-react";

import { FreeShippingProgress } from "@/components/shipping/free-shipping-progress";
import { useCommerce } from "@/components/providers/commerce-provider";
import { useTranslation } from "@/lib/i18n/language-provider";
import { DEFAULT_SHIPPING_SETTINGS } from "@/lib/shipping/settings";
import { cn } from "@/lib/utils";

interface ShippingPromoBannerProps {
  className?: string;
}

export function ShippingPromoBanner({ className }: ShippingPromoBannerProps) {
  const { t } = useTranslation();
  const { shipping } = useCommerce();
  const threshold = shipping.freeShippingThreshold;
  const fee = DEFAULT_SHIPPING_SETTINGS.defaultShippingPrice;

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
          <p className="font-semibold text-emerald-800">
            {t("shipping.freeNow")}
          </p>
          <p className="text-emerald-700/90">{t("shipping.freeNowSub")}</p>
        </div>
      </div>
    );
  }

  if (shipping.subtotal > 0) {
    return (
      <div
        className={cn(
          "space-y-3 rounded-xl border border-accent/20 bg-accent/5 px-3 py-3 text-xs",
          className,
        )}
      >
        <div className="flex items-start gap-2">
          <Truck className="mt-0.5 size-4 shrink-0 text-accent" />
          <p className="leading-relaxed text-foreground/90">
            {t("shipping.promoDetail", { threshold, fee })}
          </p>
        </div>
        <FreeShippingProgress shipping={shipping} compact />
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
      <p>{t("shipping.marketingThreshold")}</p>
    </div>
  );
}
