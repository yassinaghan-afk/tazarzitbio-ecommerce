"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ShoppingBag, Zap } from "lucide-react";
import { useState } from "react";

import { WeightOfferModal } from "@/components/catalog/weight-offer-modal";
import { useCommerce } from "@/components/providers/commerce-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/ui/star-rating";
import { cardHoverProps } from "@/lib/animations";
import {
  buildAddToCartPayload,
  getStartingOffer,
} from "@/lib/cart/product-payload";
import type { PublicProduct } from "@/lib/products";
import { getProductShopPath } from "@/lib/products/amlou-royal";
import { getBadgeLabel } from "@/lib/i18n/badges";
import { useTranslation } from "@/lib/i18n/language-provider";
import {
  localizeProductName,
  localizeProductShortDescription,
  localizeWeightLabel,
} from "@/lib/i18n/product-locale";
import { cn } from "@/lib/utils";

interface CatalogProductCardProps {
  product: PublicProduct;
  className?: string;
  /** Thank-you upsell: single «اطلب الآن» → checkout (new order) */
  showAddToCart?: boolean;
}

const MOBILE_CTA =
  "min-h-12 h-12 w-full text-base font-bold rounded-xl sm:min-h-11 sm:h-11 sm:flex-1";

export function CatalogProductCard({
  product,
  className,
  showAddToCart = true,
}: CatalogProductCardProps) {
  const { t, locale } = useTranslation();
  const { orderNow, addToCart } = useCommerce();
  const [weightOpen, setWeightOpen] = useState(false);
  const [weightMode, setWeightMode] = useState<"order" | "cart">("order");
  const startingOffer = getStartingOffer(product);
  const fromPrice = startingOffer.price;
  const productHref = getProductShopPath(product.slug);
  const hasVariants = product.offers.length > 1;
  const orderOnlyCard = !showAddToCart;
  const displayName = localizeProductName(product, locale);
  const displayShort = localizeProductShortDescription(product, locale);
  const displayWeight = product.weight
    ? localizeWeightLabel(product.weight, locale)
    : "";

  const openWeightPicker = (mode: "order" | "cart") => {
    if (product.offers.length <= 1) {
      const payload = buildAddToCartPayload(product, startingOffer);
      if (mode === "cart") {
        addToCart({ ...payload, openDrawer: "cart" });
      } else {
        orderNow(payload);
      }
      return;
    }
    setWeightMode(mode);
    setWeightOpen(true);
  };

  const handleOrderNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    openWeightPicker("order");
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    openWeightPicker("cart");
  };

  return (
    <>
      <WeightOfferModal
        product={product}
        open={weightOpen}
        onClose={() => setWeightOpen(false)}
        mode={weightMode}
      />

      <motion.article
        {...cardHoverProps}
        className={cn(
          "group flex flex-col overflow-hidden rounded-2xl bg-card",
          className,
        )}
      >
        <Link
          href={productHref}
          className={cn(
            "relative block aspect-square overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2",
            product.slug === "amlou-royal" ? "bg-white" : "bg-[#faf8f5]",
          )}
        >
          <Image
            src={product.image}
            alt={displayName}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 320px"
            className="object-contain object-center p-3 transition-transform duration-500 group-hover:scale-[1.02] sm:p-4"
            quality={88}
          />
          <div className="absolute start-3 top-3 z-[2] flex flex-wrap gap-1.5">
            {product.badges.slice(0, 2).map((b) => (
              <Badge key={b} variant={b === "bestseller" ? "premium" : "gold"}>
                {getBadgeLabel(b, locale)}
              </Badge>
            ))}
          </div>
        </Link>

        <div className="flex flex-1 flex-col gap-3 p-5">
          <div className="flex items-center justify-between gap-2">
            <StarRating rating={product.rating} showValue />
            {displayWeight && (
              <span className="text-2xs text-muted-foreground">
                {displayWeight}
              </span>
            )}
          </div>

          <Link
            href={productHref}
            className="block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <h3 className="text-base font-bold leading-snug text-foreground transition-colors group-hover:text-accent">
              {displayName}
            </h3>
            <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
              {displayShort}
            </p>
          </Link>

          <div className="flex flex-wrap items-baseline gap-2">
            {hasVariants && (
              <span className="text-sm text-muted-foreground">
                {t("common.from")}
              </span>
            )}
            <span className="text-xl font-extrabold tabular-nums text-accent">
              {fromPrice}
              <span className="ms-1 text-sm font-semibold">
                {t("common.currency")}
              </span>
            </span>
            {hasVariants && (
              <span className="w-full text-xs text-muted-foreground">
                {t("weightModal.cardHint")}
              </span>
            )}
          </div>

          <div
            className={cn(
              "mt-auto flex flex-col gap-2.5",
              !orderOnlyCard && "sm:flex-row",
            )}
          >
            <Button
              variant="gold"
              size="lg"
              className={cn(
                MOBILE_CTA,
                "gap-2 shadow-gold",
                orderOnlyCard && "sm:w-full",
              )}
              onClick={handleOrderNow}
            >
              <Zap className="size-4" />
              {t("catalog.orderNow")}
            </Button>
            {showAddToCart && (
              <Button
                variant="outline"
                size="lg"
                className={cn(MOBILE_CTA, "gap-2")}
                onClick={handleAddToCart}
              >
                <ShoppingBag className="size-4" />
                {t("catalog.addToCart")}
              </Button>
            )}
          </div>
          {showAddToCart && (
            <Button
              variant="ghost"
              size="sm"
              className="hidden w-full text-muted-foreground sm:inline-flex"
              asChild
              onClick={(e) => e.stopPropagation()}
            >
              <Link href={productHref}>{t("catalog.viewDetails")}</Link>
            </Button>
          )}
        </div>
      </motion.article>
    </>
  );
}
