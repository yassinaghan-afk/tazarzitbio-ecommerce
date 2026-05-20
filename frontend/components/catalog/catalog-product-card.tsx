"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ShoppingBag, Zap } from "lucide-react";

import { useCommerce } from "@/components/providers/commerce-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/ui/star-rating";
import { cardHoverProps } from "@/lib/animations";
import {
  buildAddToCartPayload,
  getStartingOffer,
} from "@/lib/cart/product-payload";
import { isFamilyPackProduct } from "@/lib/brand";
import type { PublicProduct } from "@/lib/products";
import { BADGE_LABELS } from "@/lib/products";
import { cn } from "@/lib/utils";

interface CatalogProductCardProps {
  product: PublicProduct;
  className?: string;
}

const MOBILE_CTA =
  "min-h-12 h-12 w-full text-base font-bold rounded-xl sm:min-h-11 sm:h-11 sm:flex-1";

export function CatalogProductCard({ product, className }: CatalogProductCardProps) {
  const router = useRouter();
  const { orderNow, addToCart } = useCommerce();
  const startingOffer = getStartingOffer(product);
  const fromPrice = startingOffer.price;
  const productHref = `/products/${product.slug}`;
  const hasVariants = product.offers.length > 1;
  const orderOnly = isFamilyPackProduct(product.slug);

  const handleOrderNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    orderNow(buildAddToCartPayload(product, startingOffer));
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(
      buildAddToCartPayload(product, startingOffer, { openDrawer: "cart" }),
    );
  };

  const goToProduct = () => {
    router.push(productHref);
  };

  return (
    <motion.article
      {...cardHoverProps}
      role="link"
      tabIndex={0}
      onClick={goToProduct}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          goToProduct();
        }
      }}
      className={cn(
        "group flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-border/70 bg-card shadow-warm-md",
        className,
      )}
    >
      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-[#3d2818] via-[#4a3020] to-[#2a1810]">
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
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-center justify-between gap-2">
          <StarRating rating={product.rating} showValue />
          {product.weight && (
            <span className="text-2xs text-muted-foreground">{product.weight}</span>
          )}
        </div>

        <div>
          <h3 className="text-base font-bold leading-snug text-foreground transition-colors group-hover:text-accent">
            {product.nameAr}
          </h3>
          <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {product.shortDescription}
          </p>
        </div>

        <div className="flex flex-wrap items-baseline gap-2">
          {hasVariants && (
            <span className="text-sm text-muted-foreground">ابتداءً من</span>
          )}
          <span className="text-xl font-extrabold tabular-nums text-accent">
            {fromPrice}
            <span className="ms-1 text-sm font-semibold">د.م.</span>
          </span>
        </div>

        <div
          className={cn(
            "mt-auto flex flex-col gap-2.5",
            !orderOnly && "sm:flex-row",
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            variant="gold"
            size="lg"
            className={cn(MOBILE_CTA, "gap-2 shadow-gold", orderOnly && "sm:w-full")}
            onClick={handleOrderNow}
          >
            <Zap className="size-4" />
            اطلب الآن
          </Button>
          {!orderOnly && (
            <Button
              variant="outline"
              size="lg"
              className={cn(MOBILE_CTA, "gap-2")}
              onClick={handleAddToCart}
            >
              <ShoppingBag className="size-4" />
              أضف للسلة
            </Button>
          )}
        </div>
        {!orderOnly && (
          <Button
            variant="ghost"
            size="sm"
            className="hidden w-full text-muted-foreground sm:inline-flex"
            asChild
            onClick={(e) => e.stopPropagation()}
          >
            <Link href={productHref}>عرض التفاصيل</Link>
          </Button>
        )}
      </div>
    </motion.article>
  );
}
