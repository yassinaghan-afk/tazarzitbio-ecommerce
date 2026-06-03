"use client";

import { motion } from "framer-motion";
import { Package, Zap } from "lucide-react";

import { useCommerce } from "@/components/providers/commerce-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cardHoverProps } from "@/lib/animations";
import {
  buildAddToCartPayload,
  getStartingOffer,
} from "@/lib/cart/product-payload";
import { getPublicProductBySlug } from "@/lib/products/catalog";
import { useTranslation } from "@/lib/i18n/language-provider";
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
  gold: "border-accent/40 bg-gradient-to-br from-amber-50 to-orange-50",
  olive: "border-primary/30 bg-gradient-to-br from-emerald-50 to-green-50",
};

const ORDER_CTA =
  "min-h-12 h-12 w-full gap-2 text-base font-bold rounded-xl shadow-gold sm:max-w-xs";

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
  const { t } = useTranslation();
  const { orderNow } = useCommerce();
  const savings = comparePrice != null ? comparePrice - price : 0;

  const handleOrderNow = () => {
    if (!productSlug) return;
    const product = getPublicProductBySlug(productSlug);
    if (!product) return;
    orderNow(buildAddToCartPayload(product, getStartingOffer(product)));
  };

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
          <span className="text-xs font-bold text-foreground">
            {t("bundle.popular")}
          </span>
        </div>
      )}

      <div className="p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent/10">
            <Package className="size-6 text-accent" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">{title}</h3>
            <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
          </div>
        </div>

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

        <div className="my-5 gold-divider" />

        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold tabular-nums text-accent">
                {price}
              </span>
              <span className="text-sm font-medium text-accent">
                {t("common.currency")}
              </span>
              {comparePrice != null && (
                <span className="text-sm text-muted-foreground line-through tabular-nums">
                  {comparePrice} {t("common.currency")}
                </span>
              )}
            </div>
            {savings > 0 && (
              <Badge variant="success" className="mt-1">
                {t("bundle.save", { amount: savings })}
              </Badge>
            )}
          </div>

          <Button
            variant="gold"
            size="lg"
            className={ORDER_CTA}
            onClick={handleOrderNow}
            disabled={!productSlug}
          >
            <Zap className="size-4" />
            {t("bundle.orderNow")}
          </Button>
        </div>
      </div>
    </motion.article>
  );
}
