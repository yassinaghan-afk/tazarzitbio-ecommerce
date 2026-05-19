"use client";

import Image from "next/image";
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
  imageSrc?: string;
  imageAlt?: string;
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
  imageSrc,
  imageAlt,
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
        "group relative flex flex-col overflow-hidden rounded-2xl border border-border/70 bg-card shadow-warm-md ring-1 ring-white/50",
        "transition-shadow duration-300 hover:shadow-warm-xl",
        !inStock && "opacity-70",
        className,
      )}
    >
      <div
        className={cn(
          "relative flex aspect-[4/5] items-center justify-center overflow-hidden sm:aspect-square",
          imageSrc
            ? "bg-gradient-to-br from-[#3d2818] via-[#4a3020] to-[#2a1810]"
            : cn("bg-gradient-to-br", gradient),
        )}
      >
        {imageSrc ? (
          <>
            <div
              aria-hidden
              className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_15%,hsl(45_80%_55%/0.2)_0%,transparent_55%)]"
            />
            <Image
              src={imageSrc}
              alt={imageAlt ?? name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 280px"
              className="object-contain object-center p-3 transition-transform duration-500 ease-out group-hover:scale-[1.02] sm:p-4"
              quality={88}
            />
          </>
        ) : (
          <>
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_15%,hsl(0_0%_100%/0.4),transparent_55%)]" />
            <div className="absolute inset-0 bg-gradient-radial-gold opacity-25" />
            <span
              className="relative z-[1] text-6xl drop-shadow-[0_8px_16px_hsl(20_30%_10%/0.12)] transition-transform duration-500 ease-out group-hover:scale-110"
              aria-hidden
            >
              {emoji}
            </span>
          </>
        )}
        <div className="absolute start-3 top-3 z-[2] flex flex-col gap-1.5">
          {soldLabel && <Badge variant="premium">{soldLabel}</Badge>}
          {isNew && <Badge variant="gold">جديد</Badge>}
          {!inStock && <Badge variant="sand">نفذ المخزون</Badge>}
          {savings > 0 && (
            <Badge variant="success">وفّر {savings} د.م.</Badge>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3.5 p-5 pt-4">
        {rating !== undefined && (
          <div className="flex items-center justify-between gap-2 border-b border-border/50 pb-3">
            <StarRating rating={rating} showValue />
            {reviewCount !== undefined && (
              <span className="flex items-center gap-1 text-2xs text-muted-foreground">
                <Users className="size-3" aria-hidden />
                {reviewCount}+
              </span>
            )}
          </div>
        )}

        <div>
          <h3 className="text-base font-bold leading-snug tracking-tight text-foreground">
            {name}
          </h3>
          {weight && (
            <p className="mt-1 text-xs text-muted-foreground">{weight}</p>
          )}
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-xl font-extrabold tabular-nums text-accent">
            {price}
            <span className="ms-1 text-sm font-semibold">د.م.</span>
          </span>
          {comparePrice && (
            <span className="text-sm text-muted-foreground line-through tabular-nums">
              {comparePrice} د.م.
            </span>
          )}
        </div>

        <p className="text-2xs font-medium tracking-wide text-primary/60">
          طبيعي 100% · COD
        </p>

        <Button
          variant="gold"
          size="default"
          className="mt-auto w-full gap-2 rounded-xl"
          disabled={!inStock}
        >
          <ShoppingBag className="size-4" />
          {inStock ? "أضف إلى السلة" : "غير متوفر"}
        </Button>
      </div>
    </motion.article>
  );
}
