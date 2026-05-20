"use client";

import { ShoppingBag, Zap } from "lucide-react";

import { useCommerce } from "@/components/providers/commerce-provider";
import { Button } from "@/components/ui/button";
import { buildAddToCartPayload } from "@/lib/cart/product-payload";
import type { PublicProduct, PublicProductOffer } from "@/lib/products/types";
import { cn } from "@/lib/utils";

interface ProductPurchaseActionsProps {
  product: PublicProduct;
  offer: PublicProductOffer;
  className?: string;
  layout?: "stack" | "row";
}

export function ProductPurchaseActions({
  product,
  offer,
  className,
  layout = "stack",
}: ProductPurchaseActionsProps) {
  const { orderNow, addToCart } = useCommerce();

  const handleOrderNow = () => {
    orderNow(buildAddToCartPayload(product, offer));
  };

  const handleAddToCart = () => {
    addToCart(buildAddToCartPayload(product, offer, { openDrawer: "cart" }));
  };

  return (
    <div
      className={cn(
        layout === "row" ? "flex gap-2" : "flex flex-col gap-2 sm:flex-row",
        className,
      )}
    >
      <Button
        variant="gold"
        size="xl"
        className="flex-1 gap-2 rounded-full shadow-gold"
        onClick={handleOrderNow}
      >
        <Zap className="size-5" />
        اطلب الآن
      </Button>
      <Button
        variant="outline"
        size="xl"
        className="flex-1 gap-2 rounded-full"
        onClick={handleAddToCart}
      >
        <ShoppingBag className="size-5" />
        أضف للسلة
      </Button>
    </div>
  );
}
