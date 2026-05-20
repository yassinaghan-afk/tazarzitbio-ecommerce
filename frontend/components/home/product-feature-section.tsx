"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Check, Zap } from "lucide-react";

import { Container, Section } from "@/components/layout/container";
import { useCommerce } from "@/components/providers/commerce-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { fadeUp, VIEWPORT } from "@/lib/animations";
import {
  buildAddToCartPayload,
  getStartingOffer,
} from "@/lib/cart/product-payload";
import { getPublicProductBySlug } from "@/lib/products/catalog";
import { cn } from "@/lib/utils";

export interface ProductFeatureProps {
  id: string;
  label: string;
  title: string;
  description: string;
  bullets?: readonly string[];
  price: number;
  comparePrice?: number;
  weight?: string;
  imageSrc: string;
  imageAlt: string;
  imageFirst?: boolean;
  badge?: string;
}

export function ProductFeatureSection({
  id,
  label,
  title,
  description,
  bullets = [],
  price,
  comparePrice,
  weight,
  imageSrc,
  imageAlt,
  imageFirst = false,
  badge,
}: ProductFeatureProps) {
  const router = useRouter();
  const { orderNow } = useCommerce();
  const productHref = `/products/${id}`;
  const savings = comparePrice ? comparePrice - price : 0;

  const handleOrderNow = () => {
    const product = getPublicProductBySlug(id);
    if (!product) {
      router.push(productHref);
      return;
    }
    orderNow(buildAddToCartPayload(product, getStartingOffer(product)));
  };

  const goToProduct = () => router.push(productHref);

  const copy = (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={VIEWPORT}
      className="flex flex-col justify-center gap-6 lg:gap-8"
    >
      <div className="flex flex-col gap-4">
        <Badge variant="premium" className="w-fit gap-1.5 px-3 py-1.5 text-xs">
          {label}
        </Badge>
        <h2 className="text-display text-3xl text-foreground sm:text-4xl lg:text-[2.35rem]">
          {title}
        </h2>
        <p className="max-w-lg text-base leading-[1.85] text-muted-foreground sm:text-lg">
          {description}
        </p>
      </div>

      {bullets.length > 0 && (
        <ul className="space-y-3">
          {bullets.map((item) => (
            <li
              key={item}
              className="flex items-start gap-3 text-sm text-foreground/85 sm:text-base"
            >
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/12">
                <Check className="size-3.5 text-accent" strokeWidth={2.5} />
              </span>
              {item}
            </li>
          ))}
        </ul>
      )}

      <div className="glass-card flex flex-wrap items-center gap-4 rounded-2xl border border-border/60 p-5 shadow-warm-md">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold tabular-nums text-accent sm:text-3xl">
              {price}
              <span className="ms-1 text-base font-semibold">د.م.</span>
            </span>
            {comparePrice && (
              <span className="text-sm text-muted-foreground line-through tabular-nums">
                {comparePrice} د.م.
              </span>
            )}
          </div>
          {weight && (
            <p className="mt-1 text-xs text-muted-foreground">{weight}</p>
          )}
          {savings > 0 && (
            <p className="mt-1 text-xs font-semibold text-primary">
              وفّر {savings} د.م. · الدفع عند الاستلام
            </p>
          )}
        </div>
        <Button
          variant="gold"
          size="lg"
          className="min-h-12 h-12 w-full gap-2 rounded-xl text-base font-bold shadow-gold sm:ms-auto sm:w-auto sm:rounded-full sm:px-6"
          onClick={handleOrderNow}
        >
          <Zap className="size-4" />
          اطلب الآن
        </Button>
      </div>
    </motion.div>
  );

  const visual = (
    <motion.button
      type="button"
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={VIEWPORT}
      onClick={goToProduct}
      className="relative w-full cursor-pointer text-start"
    >
      {badge && (
        <div className="glass-card absolute start-4 top-4 z-10 rounded-full px-3 py-1.5 text-xs font-semibold text-accent shadow-warm-sm">
          {badge}
        </div>
      )}
      <div className="frame-premium relative aspect-square overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-[#3d2818] via-[#4a3020] to-[#2a1810] shadow-warm-xl sm:rounded-[2rem]">
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_40%_25%,hsl(45_80%_55%/0.22)_0%,transparent_55%)]"
        />
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 28rem"
          className="object-contain object-center p-4 sm:p-8"
          quality={90}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#1a1008]/35 via-transparent to-[hsl(45_80%_55%/0.06)]"
        />
      </div>
    </motion.button>
  );

  return (
    <Section id={id} spacing="lg" className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,hsl(40_60%_50%/0.06)_0%,transparent_50%)]"
      />
      <Container className="relative">
        <div
          className={cn(
            "grid items-center gap-10 lg:grid-cols-2 lg:gap-16 xl:gap-20",
            imageFirst && "lg:[&>*:first-child]:order-2 lg:[&>*:last-child]:order-1",
          )}
        >
          {imageFirst ? (
            <>
              {visual}
              {copy}
            </>
          ) : (
            <>
              {copy}
              {visual}
            </>
          )}
        </div>
      </Container>
    </Section>
  );
}
