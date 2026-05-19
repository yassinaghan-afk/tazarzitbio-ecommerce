"use client";

import { motion } from "framer-motion";
import { ShoppingBag } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cardHoverProps } from "@/lib/animations";
import { cn } from "@/lib/utils";

export interface ProductCardProps {
  name: string;
  nameEn?: string;
  price: number;
  comparePrice?: number;
  weight?: string;
  category?: string;
  gradient?: string;
  emoji?: string;
  isNew?: boolean;
  inStock?: boolean;
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
      {/* Image area */}
      <div
        className={cn(
          "relative flex aspect-square items-center justify-center bg-gradient-to-br",
          gradient,
          "overflow-hidden",
        )}
      >
        {/* Decorative blob */}
        <div className="absolute inset-0 bg-gradient-radial-gold opacity-40" />

        {/* Emoji placeholder (swap with next/image when photos ready) */}
        <span
          className="relative select-none text-6xl drop-shadow-md transition-transform duration-300 group-hover:scale-110"
          aria-hidden
        >
          {emoji}
        </span>

        {/* Badges top-start */}
        <div className="absolute start-3 top-3 flex flex-col gap-1.5">
          {isNew && <Badge variant="gold">جديد</Badge>}
          {!inStock && <Badge variant="sand">نفذ المخزون</Badge>}
          {savings > 0 && (
            <Badge variant="success">وفّر {savings} د.م.</Badge>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex-1">
          <h3 className="text-base font-bold leading-snug text-foreground">
            {name}
          </h3>
          {weight && (
            <p className="mt-0.5 text-xs text-muted-foreground">{weight}</p>
          )}
        </div>

        {/* Price row */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold tabular-nums text-accent">
              {price} <span className="text-sm font-medium">د.م.</span>
            </span>
            {comparePrice && (
              <span className="text-xs text-muted-foreground line-through tabular-nums">
                {comparePrice} د.م.
              </span>
            )}
          </div>
        </div>

        <Button
          variant="gold"
          size="sm"
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
