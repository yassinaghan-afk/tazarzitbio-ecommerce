"use client";

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
  return (
    <div className={cn("space-y-3", className)}>
      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between gap-3">
          <span className="text-muted-foreground">المجموع الفرعي</span>
          <span className="font-bold tabular-nums text-foreground">
            {shipping.subtotal} د.م.
          </span>
        </div>
        <div className="flex items-start justify-between gap-3">
          <span className="text-muted-foreground">
            <span className="block">{shipping.labelFr}</span>
            <span className="mt-0.5 block text-2xs">{shipping.labelAr}</span>
          </span>
          <span
            className={cn(
              "shrink-0 font-bold tabular-nums",
              shipping.isFreeShipping ? "text-emerald-600" : "text-foreground",
            )}
          >
            {shipping.isFreeShipping
              ? "0 د.م."
              : `${shipping.shippingFee} د.م.`}
          </span>
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-border/60 pt-2">
          <span className="font-bold text-foreground">الإجمالي</span>
          <span className="text-lg font-extrabold tabular-nums text-accent">
            {shipping.total} د.م.
          </span>
        </div>
      </div>

      {showUpsell && shipping.upsellMessageFr && (
        <div className="rounded-xl border border-dashed border-accent/35 bg-accent/5 px-3 py-2.5 text-xs leading-relaxed">
          <p className="font-medium text-foreground">{shipping.upsellMessageFr}</p>
          {shipping.upsellMessageAr && (
            <p className="mt-1 text-muted-foreground">{shipping.upsellMessageAr}</p>
          )}
        </div>
      )}
    </div>
  );
}
