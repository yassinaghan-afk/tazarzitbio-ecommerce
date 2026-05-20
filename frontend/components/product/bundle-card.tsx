"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Package, ShoppingBag } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cardHoverProps } from "@/lib/animations";
import { cn } from "@/lib/utils";

export interface BundleItem {
  name: string;
  emoji: string;
}

export interface BundleCardProps {
  title: string;
  description: string;
  price: number;
  comparePrice?: number;
  items: BundleItem[];
  isPopular?: boolean;
  variant?: "gold" | "olive" | "default";
  productSlug?: string;
  className?: string;
}

const variantStyles = {
  default: "border-border bg-card",
  gold:    "border-accent/40 bg-gradient-to-br from-amber-50 to-orange-50",
  olive:   "border-primary/30 bg-gradient-to-br from-emerald-50 to-green-50",
};

export function BundleCard({
  title,
  description,
  price,
  comparePrice,
  items,
  isPopular = false,
  variant = "default",
  productSlug,
  className,
}: BundleCardProps) {
  const savings = comparePrice != null ? comparePrice - price : 0;

  return (
    <motion.article
      {...cardHoverProps}
      className={cn(
        "relative flex flex-col overflow-hidden rounded-2xl border shadow-warm-sm",
        variantStyles[variant],
        className,
      )}
    >
      {isPopular && (
        <div className="absolute end-0 top-0 overflow-hidden rounded-bl-2xl rounded-tr-2xl bg-gold-gradient px-4 py-1.5">
          <span className="text-xs font-bold text-foreground">الأكثر مبيعاً ⭐</span>
        </div>
      )}

      <div className="p-6">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent/10">
            <Package className="size-6 text-accent" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">{title}</h3>
            <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
          </div>
        </div>

        {/* Items */}
        <div className="mt-5 flex flex-wrap gap-2">
          {items.map((item) => (
            <span
              key={item.name}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-foreground"
            >
              <span aria-hidden>{item.emoji}</span>
              {item.name}
            </span>
          ))}
        </div>

        {/* Divider */}
        <div className="my-5 gold-divider" />

        {/* Price + CTA */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold tabular-nums text-accent">
                {price}
              </span>
              <span className="text-sm font-medium text-accent">د.م.</span>
              {comparePrice != null && (
                <span className="text-sm text-muted-foreground line-through tabular-nums">
                  {comparePrice} د.م.
                </span>
              )}
            </div>
            {savings > 0 && (
              <Badge variant="success" className="mt-1">
                وفّر {savings} د.م.
              </Badge>
            )}
          </div>

          {productSlug ? (
            <Button variant="gold" className="shrink-0 gap-2" asChild>
              <Link href={`/products/${productSlug}`}>
                <ShoppingBag className="size-4" />
                اطلب الآن
              </Link>
            </Button>
          ) : (
            <Button variant="gold" className="shrink-0 gap-2">
              <ShoppingBag className="size-4" />
              اطلب الآن
            </Button>
          )}
        </div>
      </div>
    </motion.article>
  );
}
