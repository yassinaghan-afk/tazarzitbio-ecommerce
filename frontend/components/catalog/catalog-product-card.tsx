"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, ShoppingBag, Zap } from "lucide-react";

import { useCommerce } from "@/components/providers/commerce-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/ui/star-rating";
import { cardHoverProps } from "@/lib/animations";
import { buildAddToCartPayload, getDefaultOffer } from "@/lib/cart/product-payload";
import type { PublicProduct } from "@/lib/products";
import { BADGE_LABELS } from "@/lib/products";
import { cn } from "@/lib/utils";

interface CatalogProductCardProps {
  product: PublicProduct;
  className?: string;
}

export function CatalogProductCard({ product, className }: CatalogProductCardProps) {
  const { orderNow, addToCart } = useCommerce();
  const defaultOffer = getDefaultOffer(product);
  const fromPrice = product.price;

  const handleOrderNow = (e: React.MouseEvent) => {
    e.preventDefault();
    orderNow(buildAddToCartPayload(product, defaultOffer));
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart(buildAddToCartPayload(product, defaultOffer, { openDrawer: "cart" }));
  };

  return (
    <motion.article
      {...cardHoverProps}
      className={cn(
        "group flex flex-col overflow-hidden rounded-2xl border border-border/70 bg-card shadow-warm-md",
        className,
      )}
    >
      <Link
        href={`/products/${product.slug}`}
        className="relative aspect-square overflow-hidden bg-gradient-to-br from-[#3d2818] via-[#4a3020] to-[#2a1810]"
      >
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,hsl(45_80%_55%/0.18)_0%,transparent_55%)]"
        />
        <Image
          src={product.image}
          alt={product.nameAr}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 320px"
          className="object-contain object-center p-4 transition-transform duration-500 group-hover:scale-[1.02]"
          quality={88}
        />
        <div className="absolute start-3 top-3 z-[2] flex flex-wrap gap-1.5">
          {product.badges.slice(0, 2).map((b) => (
            <Badge key={b} variant={b === "bestseller" ? "premium" : "gold"}>
              {BADGE_LABELS[b]}
            </Badge>
          ))}
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-center justify-between gap-2">
          <StarRating rating={product.rating} showValue />
          {product.weight && (
            <span className="text-2xs text-muted-foreground">{product.weight}</span>
          )}
        </div>

        <div>
          <Link href={`/products/${product.slug}`}>
            <h3 className="text-base font-bold leading-snug text-foreground transition-colors hover:text-accent">
              {product.nameAr}
            </h3>
          </Link>
          <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {product.shortDescription}
          </p>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-xl font-extrabold tabular-nums text-accent">
            {fromPrice}
            <span className="ms-1 text-sm font-semibold">د.م.</span>
          </span>
          {product.offers.length > 1 && (
            <span className="text-xs text-muted-foreground">يبدأ من</span>
          )}
        </div>

        <div className="mt-auto flex flex-col gap-2 sm:flex-row">
          <Button
            variant="gold"
            size="default"
            className="flex-1 gap-2 rounded-xl"
            onClick={handleOrderNow}
          >
            <Zap className="size-4" />
            اطلب الآن
          </Button>
          <Button
            variant="outline"
            size="default"
            className="flex-1 gap-2 rounded-xl"
            onClick={handleAddToCart}
          >
            <ShoppingBag className="size-4" />
            أضف للسلة
          </Button>
          <Button variant="outline" size="icon" className="rounded-xl sm:hidden" asChild>
            <Link href={`/products/${product.slug}`} aria-label="عرض التفاصيل">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="hidden w-full text-muted-foreground sm:inline-flex"
          asChild
        >
          <Link href={`/products/${product.slug}`}>عرض التفاصيل</Link>
        </Button>
      </div>
    </motion.article>
  );
}
