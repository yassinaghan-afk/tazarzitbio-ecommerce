"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShieldCheck, ShoppingBag, Trash2, Truck } from "lucide-react";

import { HoneyUpsellSection } from "@/components/checkout/honey-upsell-section";
import { OrderTotals } from "@/components/cart/order-totals";
import { BrandLogo } from "@/components/brand/brand-logo";
import { useCommerce } from "@/components/providers/commerce-provider";
import { Button } from "@/components/ui/button";
import { Drawer } from "@/components/ui/drawer";
import { useTranslation } from "@/lib/i18n/language-provider";

export function CartDrawer() {
  const { t } = useTranslation();
  const {
    items,
    shipping,
    cartOpen,
    closeCart,
    openCheckout,
    removeItem,
    updateQuantity,
    crossSellProducts,
  } = useCommerce();

  return (
    <Drawer
      open={cartOpen}
      onClose={closeCart}
      title={t("cart.title")}
      footer={
        items.length > 0 ? (
          <div className="space-y-4">
            <OrderTotals shipping={shipping} />
            <div className="flex items-center gap-2 rounded-xl bg-secondary/60 px-3 py-2.5 text-xs text-muted-foreground">
              <Truck className="size-4 shrink-0 text-accent" />
              {t("cart.codNote")}
            </div>
            <Button
              variant="gold"
              size="lg"
              className="min-h-12 w-full rounded-full shadow-gold"
              onClick={openCheckout}
            >
              {t("cart.checkout")}
            </Button>
          </div>
        ) : undefined
      }
    >
      <div className="mb-4 flex justify-center sm:justify-start">
        <BrandLogo variant="compact" />
      </div>
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary">
            <ShoppingBag className="size-8 text-muted-foreground" />
          </div>
          <p className="font-bold text-foreground">{t("cart.empty")}</p>
          <p className="text-sm text-muted-foreground">{t("cart.emptySub")}</p>
          <Button variant="gold" className="min-h-12 rounded-full" asChild onClick={closeCart}>
            <Link href="/products">{t("cart.shopProducts")}</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          <ul className="space-y-4">
            {items.map((item) => (
              <li
                key={item.lineId}
                className="flex gap-3 rounded-2xl border border-border/60 bg-background/50 p-3"
              >
                <Link
                  href={`/products/${item.slug}`}
                  onClick={closeCart}
                  className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-[#3d2818] to-[#2a1810]"
                >
                  <Image
                    src={item.image}
                    alt={item.nameAr}
                    fill
                    sizes="80px"
                    className="object-contain p-1.5"
                  />
                </Link>
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <div>
                    <Link
                      href={`/products/${item.slug}`}
                      onClick={closeCart}
                      className="line-clamp-2 text-sm font-bold text-foreground hover:text-accent"
                    >
                      {item.nameAr}
                    </Link>
                    <p className="text-xs text-muted-foreground">{item.offerLabel}</p>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-0.5">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={t("cart.decrease")}
                        onClick={() =>
                          updateQuantity(item.lineId, item.quantity - 1)
                        }
                      >
                        <Minus className="size-3.5" />
                      </Button>
                      <span className="min-w-[1.5rem] text-center text-sm font-bold tabular-nums">
                        {item.quantity}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={t("cart.increase")}
                        onClick={() =>
                          updateQuantity(item.lineId, item.quantity + 1)
                        }
                      >
                        <Plus className="size-3.5" />
                      </Button>
                    </div>
                    <span className="text-sm font-extrabold tabular-nums text-accent">
                      {item.unitPrice * item.quantity} {t("common.currency")}
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={t("cart.remove")}
                  className="shrink-0 self-start text-muted-foreground hover:text-destructive"
                  onClick={() => removeItem(item.lineId)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </li>
            ))}
          </ul>

          <div className="flex items-start gap-2 rounded-xl border border-accent/20 bg-accent/5 p-3 text-xs text-foreground/80">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-accent" />
            <p>{t("cart.secureNote")}</p>
          </div>

          {crossSellProducts.length > 0 && (
            <HoneyUpsellSection
              products={crossSellProducts}
              title={t("cart.honeyTitle")}
              subtitle={t("cart.honeySub")}
              layout="inline"
              compact
            />
          )}
        </div>
      )}
    </Drawer>
  );
}
