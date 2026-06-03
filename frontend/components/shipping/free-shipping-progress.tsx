"use client";

import { useTranslation } from "@/lib/i18n/language-provider";
import type { ShippingResult } from "@/lib/shipping/calculate";
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
  const { t, dir } = useTranslation();

  if (shipping.subtotal <= 0 || shipping.isFreeShipping) return null;

  return (
    <div className={cn("space-y-2", className)}>
      <div
        className="h-2 overflow-hidden rounded-full bg-border/80"
        role="progressbar"
        aria-valuenow={shipping.progressPercent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={t("shipping.progressAria")}
      >
        <div
          className={cn(
            "h-full rounded-full bg-gradient-to-r from-accent to-amber-500 transition-[width] duration-300 ease-out",
            dir === "rtl" && "bg-gradient-to-l",
          )}
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
          {t("shipping.remaining")} {shipping.amountRemaining} {t("common.currency")}
        </span>{" "}
        {t("shipping.forFree")}
        {!compact && (
          <span className="mt-0.5 block text-2xs">{t("shipping.marketing")}</span>
        )}
      </p>
    </div>
  );
}
