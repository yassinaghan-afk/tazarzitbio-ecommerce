"use client";

import Image from "next/image";
import { Plus } from "lucide-react";

import { useCommerce } from "@/components/providers/commerce-provider";
import { Button } from "@/components/ui/button";
import { buildAddToCartPayload, getDefaultOffer } from "@/lib/cart/product-payload";
import type { PublicProduct } from "@/lib/products/types";

interface CheckoutCrossSellProps {
  products: PublicProduct[];
}

export function CheckoutCrossSell({ products }: CheckoutCrossSellProps) {
  const { addToCart } = useCommerce();

  if (products.length === 0) return null;

  return (
    <div className="rounded-2xl border border-border/60 bg-background/60 p-4">
      <p className="mb-3 text-xs font-bold text-accent">منتجات مقترحة</p>
      <ul className="space-y-3">
        {products.map((product) => {
          const offer = getDefaultOffer(product);
          return (
            <li
              key={product.id}
              className="flex items-center gap-3 rounded-xl border border-border/50 bg-card/50 p-2"
            >
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-[#3d2818] to-[#2a1810]">
                <Image
                  src={product.image}
                  alt={product.nameAr}
                  fill
                  sizes="56px"
                  className="object-contain p-1"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-foreground">
                  {product.nameAr}
                </p>
                <p className="text-xs text-accent">{offer.price} د.م.</p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="shrink-0 gap-1 rounded-full border-accent/40 px-3 text-xs font-bold text-accent hover:bg-accent/10"
                onClick={() =>
                  addToCart(
                    buildAddToCartPayload(product, offer, { openDrawer: "none" }),
                  )
                }
              >
                <Plus className="size-3.5" />
                أضف
              </Button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
