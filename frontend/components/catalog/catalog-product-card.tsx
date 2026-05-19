"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, ShoppingBag } from "lucide-react";

import { useCommerce } from "@/components/providers/commerce-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/ui/star-rating";
import { cardHoverProps } from "@/lib/animations";
import type { Product } from "@/lib/products";
import { BADGE_LABELS } from "@/lib/products";
import { cn } from "@/lib/utils";

interface CatalogProductCardProps {
  product: Product;
  className?: string;
}

export function CatalogProductCard({ product, className }: CatalogProductCardProps) {
  const { addToCart } = useCommerce();
  const defaultOffer = product.offers[0];
  const savings =
    defaultOffer.oldPrice != null
      ? defaultOffer.oldPrice - defaultOffer.price
      : 0;

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
          {savings > 0 && (
            <Badge variant="success">وفّر {savings} د.م.</Badge>
          )}
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
            {defaultOffer.price}
            <span className="ms-1 text-sm font-semibold">د.م.</span>
          </span>
          {defaultOffer.oldPrice && (
            <span className="text-sm text-muted-foreground line-through tabular-nums">
              {defaultOffer.oldPrice} د.م.
            </span>
          )}
        </div>

        <div className="mt-auto flex gap-2">
          <Button
            variant="gold"
            size="default"
            className="flex-1 gap-2 rounded-xl"
            onClick={() =>
              addToCart({
                productId: product.id,
                slug: product.slug,
                nameAr: product.nameAr,
                image: product.image,
                offerId: defaultOffer.id,
                offerLabel: defaultOffer.label,
                unitPrice: defaultOffer.price,
              })
            }
          >
            <ShoppingBag className="size-4" />
            أضف للسلة
          </Button>
          <Button variant="outline" size="icon" className="rounded-xl" asChild>
            <Link href={`/products/${product.slug}`} aria-label="عرض التفاصيل">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </motion.article>
  );
}
