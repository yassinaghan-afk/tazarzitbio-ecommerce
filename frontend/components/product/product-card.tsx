"use client";

import { motion } from "framer-motion";
import { ShoppingBag, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/ui/star-rating";
import { cardHoverProps } from "@/lib/animations";
import { cn } from "@/lib/utils";

export interface ProductCardProps {
  name: string;
  price: number;
  comparePrice?: number;
  weight?: string;
  gradient?: string;
  emoji?: string;
  isNew?: boolean;
  inStock?: boolean;
  rating?: number;
  reviewCount?: number;
  soldLabel?: string;
  className?: string;
}

export function ProductCard({
  name,
  price,
  comparePrice,
  weight,
  gradient = "from-amber-50 via-orange-50 to-yellow-100",
  emoji = "🫙",
  isNew = false,
  inStock = true,
  rating,
  reviewCount,
  soldLabel,
  className,
}: ProductCardProps) {
  const savings = comparePrice ? comparePrice - price : 0;

  return (
    <motion.article
      {...cardHoverProps}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-warm-sm",
        !inStock && "opacity-70",
        className,
      )}
    >
      <div
        className={cn(
          "relative flex aspect-square items-center justify-center overflow-hidden bg-gradient-to-br",
          gradient,
        )}
      >
        <div className="absolute inset-0 bg-gradient-radial-gold opacity-30" />
        <span
          className="relative text-6xl drop-shadow-md transition-transform duration-500 group-hover:scale-110"
          aria-hidden
        >
          {emoji}
        </span>
        <div className="absolute start-3 top-3 flex flex-col gap-1.5">
          {soldLabel && <Badge variant="premium">{soldLabel}</Badge>}
          {isNew && <Badge variant="gold">جديد</Badge>}
          {!inStock && <Badge variant="sand">نفذ المخزون</Badge>}
          {savings > 0 && (
            <Badge variant="success">وفّر {savings} د.م.</Badge>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        {rating !== undefined && (
          <div className="flex items-center justify-between gap-2">
            <StarRating rating={rating} showValue />
            {reviewCount !== undefined && (
              <span className="flex items-center gap-1 text-2xs text-muted-foreground">
                <Users className="size-3" aria-hidden />
                {reviewCount}+
              </span>
            )}
          </div>
        )}

        <div className="flex-1">
          <h3 className="text-base font-bold leading-snug text-foreground">
            {name}
          </h3>
          {weight && (
            <p className="mt-1 text-xs text-muted-foreground">{weight}</p>
          )}
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-xl font-bold tabular-nums text-accent">
            {price}
            <span className="ms-1 text-sm font-medium">د.م.</span>
          </span>
          {comparePrice && (
            <span className="text-sm text-muted-foreground line-through tabular-nums">
              {comparePrice} د.م.
            </span>
          )}
        </div>

        <p className="text-2xs font-medium text-primary/70">
          ✓ طبيعي 100% · الدفع عند الاستلام
        </p>

        <Button
          variant="gold"
          size="default"
          className="w-full gap-2"
          disabled={!inStock}
        >
          <ShoppingBag className="size-4" />
          {inStock ? "أضف إلى السلة" : "غير متوفر"}
        </Button>
      </div>
    </motion.article>
  );
}
