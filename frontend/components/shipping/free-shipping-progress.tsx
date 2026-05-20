"use client";

import type { ShippingResult } from "@/lib/shipping/calculate";
import { FREE_SHIPPING_MARKETING_AR } from "@/lib/shipping/settings";
import { cn } from "@/lib/utils";

interface FreeShippingProgressProps {
  shipping: ShippingResult;
  className?: string;
  compact?: boolean;
}

export function FreeShippingProgress({
  shipping,
  className,
  compact = false,
}: FreeShippingProgressProps) {
  if (shipping.subtotal <= 0 || shipping.isFreeShipping) return null;

  return (
    <div className={cn("space-y-2", className)}>
      <div
        className="h-2 overflow-hidden rounded-full bg-border/80"
        role="progressbar"
        aria-valuenow={shipping.progressPercent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="التقدم نحو التوصيل المجاني"
      >
        <div
          className="h-full rounded-full bg-gradient-to-l from-accent to-amber-500 transition-[width] duration-300 ease-out"
          style={{ width: `${shipping.progressPercent}%` }}
        />
      </div>
      <p
        className={cn(
          "text-muted-foreground",
          compact ? "text-2xs leading-snug" : "text-xs leading-relaxed",
        )}
      >
        <span className="font-semibold text-foreground">
          باقي {shipping.amountRemaining} د.م.
        </span>{" "}
        للتوصيل المجاني
        {!compact && (
          <span className="mt-0.5 block text-2xs">{FREE_SHIPPING_MARKETING_AR}</span>
        )}
      </p>
    </div>
  );
}
