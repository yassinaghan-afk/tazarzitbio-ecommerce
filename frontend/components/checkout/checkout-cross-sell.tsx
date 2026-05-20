"use client";

import Image from "next/image";

import { useCommerce } from "@/components/providers/commerce-provider";
import { Button } from "@/components/ui/button";
import { buildAddToCartPayload, getDefaultOffer } from "@/lib/cart/product-payload";
import type { PublicProduct } from "@/lib/products/types";

interface CheckoutCrossSellProps {
  products: PublicProduct[];
}

export function CheckoutCrossSell({ products }: CheckoutCrossSellProps) {
  const { orderNow } = useCommerce();

  if (products.length === 0) return null;

  return (
    <div className="rounded-2xl border border-border/60 bg-background/60 p-4">
      <p className="mb-3 text-xs font-bold text-accent">أكمل طلبك بهذه المنتجات</p>
      <ul className="space-y-3">
        {products.map((product) => {
          const offer = getDefaultOffer(product);
          return (
            <li
              key={product.id}
              className="flex items-center gap-3 rounded-xl border border-border/50 p-2"
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
                variant="gold"
                size="sm"
                className="shrink-0 rounded-full px-3 text-xs"
                onClick={() =>
                  orderNow(buildAddToCartPayload(product, offer))
                }
              >
                اطلب الآن
              </Button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
