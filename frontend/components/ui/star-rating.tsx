"use client";

import { Star } from "lucide-react";

import { useTranslation } from "@/lib/i18n/language-provider";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  max?: number;
  size?: "sm" | "md";
  showValue?: boolean;
  className?: string;
}

export function StarRating({
  rating,
  max = 5,
  size = "sm",
  showValue = false,
  className,
}: StarRatingProps) {
  const { t } = useTranslation();
  const iconSize = size === "sm" ? "size-3.5" : "size-4";

  return (
    <div
      className={cn("flex items-center gap-1.5", className)}
      aria-label={t("rating.of", { rating, max })}
    >
      <div className="flex">
        {Array.from({ length: max }).map((_, i) => (
          <Star
            key={i}
            className={cn(
              iconSize,
              i < Math.floor(rating)
                ? "fill-accent text-accent"
                : i < rating
                  ? "fill-accent/50 text-accent"
                  : "fill-border text-border",
            )}
          />
        ))}
      </div>
      {showValue && (
        <span className="text-xs font-semibold tabular-nums text-foreground/80">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}
