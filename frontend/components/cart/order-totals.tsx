"use client";

import { FreeShippingProgress } from "@/components/shipping/free-shipping-progress";
import { useTranslation } from "@/lib/i18n/language-provider";
import { getShippingDisplayLabel } from "@/lib/i18n/shipping-display";
import type { ShippingResult } from "@/lib/shipping/calculate";
import { cn } from "@/lib/utils";

interface OrderTotalsProps {
  shipping: ShippingResult;
  className?: string;
  showUpsell?: boolean;
}

export function OrderTotals({
  shipping,
  className,
  showUpsell = true,
}: OrderTotalsProps) {
  const { t, locale } = useTranslation();
  const shippingLabel = getShippingDisplayLabel(shipping, locale);

  return (
    <div className={cn("space-y-3", className)}>
      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between gap-3">
          <span className="text-muted-foreground">{t("common.subtotal")}</span>
          <span className="font-bold tabular-nums text-foreground">
            {shipping.subtotal} {t("common.currency")}
          </span>
        </div>
        <div className="flex items-start justify-between gap-3">
          <span className="text-muted-foreground">
            <span className="block">{shippingLabel.primary}</span>
            {shippingLabel.secondary && (
              <span className="mt-0.5 block text-2xs">{shippingLabel.secondary}</span>
            )}
          </span>
          <span
            className={cn(
              "shrink-0 font-bold tabular-nums",
              shipping.isFreeShipping ? "text-emerald-600" : "text-foreground",
            )}
          >
            {shipping.isFreeShipping
              ? t("common.free")
              : `${shipping.shippingFee} ${t("common.currency")}`}
          </span>
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-border/60 pt-2">
          <span className="font-bold text-foreground">{t("common.total")}</span>
          <span className="text-lg font-extrabold tabular-nums text-accent">
            {shipping.total} {t("common.currency")}
          </span>
        </div>
      </div>

      {showUpsell && shipping.subtotal > 0 && !shipping.isFreeShipping && (
        <FreeShippingProgress shipping={shipping} />
      )}
    </div>
  );
}
