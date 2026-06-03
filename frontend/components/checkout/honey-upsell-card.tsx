"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Plus, Zap } from "lucide-react";

import { useCommerce } from "@/components/providers/commerce-provider";
import { Button } from "@/components/ui/button";
import { buildAddToCartPayload } from "@/lib/cart/product-payload";
import type { PublicProduct, PublicProductOffer } from "@/lib/products/types";
import { cn } from "@/lib/utils";

export type HoneyUpsellCtaMode = "addToOrder" | "orderNow";

interface HoneyUpsellCardProps {
  product: PublicProduct;
  compact?: boolean;
  className?: string;
  /** checkout/cart: add to current order; thank-you: new order → checkout */
  ctaMode?: HoneyUpsellCtaMode;
}

export function HoneyUpsellCard({
  product,
  compact = false,
  className,
  ctaMode = "addToOrder",
}: HoneyUpsellCardProps) {
  const { addToCart, orderNow } = useCommerce();
  const productHref = `/products/${product.slug}`;
  const [selectedOfferId, setSelectedOfferId] = useState(
    () => product.offers[0]?.id ?? "",
  );

  const selectedOffer: PublicProductOffer = useMemo(() => {
    return (
      product.offers.find((o) => o.id === selectedOfferId) ??
      product.offers[0]!
    );
  }, [product.offers, selectedOfferId]);

  const showVariants = product.offers.length > 1;
  const isOrderNow = ctaMode === "orderNow";

  const handleCta = () => {
    const payload = buildAddToCartPayload(product, selectedOffer, {
      openDrawer: "none",
    });
    if (isOrderNow) {
      orderNow(payload);
    } else {
      addToCart(payload);
    }
  };

  return (
    <article
      className={cn(
        "group overflow-hidden rounded-2xl border border-foreground/10 bg-gradient-to-b from-card to-secondary/20",
        "shadow-warm-md ring-1 ring-border/40 transition-all duration-300",
        "hover:border-accent/40 hover:shadow-gold hover:ring-accent/20",
        className,
      )}
    >
      <div
        aria-hidden
        className="h-px w-full bg-gradient-to-r from-transparent via-accent/50 to-transparent opacity-80"
      />
      <div
        className={cn(
          "flex gap-3",
          compact ? "p-3" : "flex-col p-4 sm:flex-row sm:gap-4",
        )}
      >
        <Link
          href={productHref}
          className={cn(
            "relative block shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-[#1a120c] to-[#2a1810] ring-1 ring-foreground/10 transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
            compact ? "h-16 w-16" : "mx-auto h-20 w-20 sm:mx-0 sm:h-24 sm:w-24",
          )}
        >
          <Image
            src={product.image}
            alt={product.nameAr}
            fill
            sizes={compact ? "64px" : "96px"}
            className="object-contain p-1.5"
          />
        </Link>

        <div className="min-w-0 flex-1 space-y-2.5">
          <div>
            <Link href={productHref}>
              <h3
                className={cn(
                  "font-extrabold leading-snug text-foreground transition-colors hover:text-accent",
                  compact ? "text-sm" : "text-base",
                )}
              >
                {product.nameAr}
              </h3>
            </Link>
            <p className="mt-0.5 flex items-baseline gap-1.5">
              <span className="text-lg font-extrabold tabular-nums text-accent">
                {selectedOffer.price}
              </span>
              <span className="text-xs font-semibold text-accent">د.م.</span>
            </p>
          </div>

          {showVariants && (
            <div className="flex flex-wrap gap-1.5" role="group" aria-label="اختر الحجم">
              {product.offers.map((offer) => (
                <button
                  key={offer.id}
                  type="button"
                  onClick={() => setSelectedOfferId(offer.id)}
                  className={cn(
                    "rounded-full border px-2.5 py-1 text-2xs font-bold transition-all",
                    selectedOffer.id === offer.id
                      ? "border-foreground bg-foreground text-primary-foreground shadow-sm"
                      : "border-border/80 bg-background/80 text-muted-foreground hover:border-accent/40",
                  )}
                >
                  {offer.label}
                </button>
              ))}
            </div>
          )}

          <Button
            type="button"
            variant="gold"
            size={compact ? "sm" : "default"}
            className={cn(
              "min-h-11 w-full gap-1.5 rounded-full font-bold shadow-gold",
              compact && "h-11 text-xs",
            )}
            onClick={handleCta}
          >
            {isOrderNow ? (
              <Zap className={compact ? "size-3.5" : "size-4"} />
            ) : (
              <Plus className={compact ? "size-3.5" : "size-4"} />
            )}
            {isOrderNow ? "اطلب الآن" : "أضف إلى الطلب"}
          </Button>
        </div>
      </div>
    </article>
  );
}
