"use client";

import { ShoppingBag, Zap } from "lucide-react";

import { useCommerce } from "@/components/providers/commerce-provider";
import { Button } from "@/components/ui/button";
import { QuantitySelector } from "@/components/product/quantity-selector";
import { buildAddToCartPayload } from "@/lib/cart/product-payload";
import type { PublicProduct, PublicProductOffer } from "@/lib/products/types";
import { useTranslation } from "@/lib/i18n/language-provider";
import { cn } from "@/lib/utils";

interface ProductPurchaseActionsProps {
  product: PublicProduct;
  offer: PublicProductOffer;
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  orderOnly?: boolean;
  className?: string;
  layout?: "stack" | "row";
}

const MOBILE_CTA =
  "min-h-12 h-12 w-full text-base font-bold rounded-xl sm:min-h-14 sm:h-14 sm:flex-1";

export function ProductPurchaseActions({
  product,
  offer,
  quantity,
  onQuantityChange,
  orderOnly = false,
  className,
  layout = "stack",
}: ProductPurchaseActionsProps) {
  const { t } = useTranslation();
  const { orderNow, addToCart } = useCommerce();

  const payload = () =>
    buildAddToCartPayload(product, offer, { quantity });

  const handleOrderNow = () => {
    orderNow(payload());
  };

  const handleAddToCart = () => {
    addToCart(buildAddToCartPayload(product, offer, { quantity, openDrawer: "cart" }));
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-bold text-foreground">الكمية</p>
        <QuantitySelector value={quantity} onChange={onQuantityChange} />
      </div>

      <div
        className={cn(
          layout === "row" ? "flex gap-2" : "flex flex-col gap-2.5 sm:flex-row",
        )}
      >
        <Button
          variant="gold"
          size="xl"
          className={cn(MOBILE_CTA, "gap-2 rounded-full shadow-gold", orderOnly && "sm:w-full")}
          onClick={handleOrderNow}
        >
          <Zap className="size-5" />
          {t("product.orderNow")}
        </Button>
        {!orderOnly && (
          <Button
            variant="outline"
            size="xl"
            className={cn(MOBILE_CTA, "gap-2 rounded-full")}
            onClick={handleAddToCart}
          >
            <ShoppingBag className="size-5" />
            {t("product.addToCart")}
          </Button>
        )}
      </div>
    </div>
  );
}
