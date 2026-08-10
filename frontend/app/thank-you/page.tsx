"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Heart,
  Home,
  ShoppingBag,
  Sparkles,
} from "lucide-react";

import { CatalogProductCard } from "@/components/catalog/catalog-product-card";
import { BrandLogo } from "@/components/brand/brand-logo";
import { useCatalogProducts } from "@/hooks/use-catalog";
import { Container, Section } from "@/components/layout/container";
import { ThankYouVerification } from "@/components/thank-you/thank-you-verification";
import { Button } from "@/components/ui/button";
import { staggerContainer, staggerItem, VIEWPORT } from "@/lib/animations";
import type { CheckoutFormData, PlacedOrder } from "@/lib/checkout/types";
import { LAST_ORDER_STORAGE_KEY } from "@/lib/checkout/types";
import { useTranslation } from "@/lib/i18n/language-provider";

export default function ThankYouPage() {
  const { t } = useTranslation();
  const allProducts = useCatalogProducts();
  const [hydrated, setHydrated] = useState(false);
  const [order, setOrder] = useState<PlacedOrder | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(LAST_ORDER_STORAGE_KEY);
      if (raw) {
        setOrder(JSON.parse(raw) as PlacedOrder);
      }
    } catch {
      setOrder(null);
    }
    setHydrated(true);
  }, []);

  // Purchase is tracked only after POST /api/orders succeeds (Pixel + CAPI).
  // Do not fire Purchase on thank-you open/refresh.

  const handleCustomerUpdate = (customer: CheckoutFormData) => {
    setOrder((prev) => {
      if (!prev) return prev;
      const next = { ...prev, customer };
      try {
        sessionStorage.setItem(LAST_ORDER_STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* ignore quota errors */
      }
      return next;
    });
  };

  return (
    <>
      <Section spacing="lg" className="texture-grain">
        <Container className="max-w-2xl">
          <div className="text-center">
            <div className="mb-6 flex justify-center">
              <BrandLogo variant="checkout" />
            </div>
            <div className="relative mx-auto mb-8 flex h-24 w-24 items-center justify-center">
              <div
                aria-hidden
                className="absolute inset-0 rounded-full bg-[radial-gradient(circle,hsl(45_80%_55%/0.35)_0%,transparent_70%)]"
              />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 shadow-warm-lg ring-2 ring-emerald-200/80">
                <CheckCircle2 className="size-11 text-emerald-600" />
              </div>
            </div>

            <div className="mb-4 flex items-center justify-center gap-2 text-accent">
              <Sparkles className="size-4" />
              <span className="text-sm font-bold">{t("thankYou.blessing")}</span>
              <Heart className="size-4 fill-accent/30 text-accent" />
            </div>

            <h1 className="text-display text-3xl text-foreground sm:text-4xl">
              {t("thankYou.title")}
            </h1>
            <p className="mx-auto mt-5 max-w-lg text-base leading-[1.9] text-muted-foreground sm:text-lg">
              {t("thankYou.subtitleBefore")}{" "}
              <strong className="font-bold text-foreground">{t("common.cod")}</strong>{" "}
              {t("thankYou.subtitleAfter")}
            </p>

            {!hydrated && (
              <p className="mt-8 text-sm text-muted-foreground" aria-live="polite">
                {t("thankYou.loading")}
              </p>
            )}

            {hydrated && !order && (
              <div className="glass-card mt-8 rounded-2xl border border-border/60 p-6 text-sm text-muted-foreground shadow-warm-md">
                <p>{t("thankYou.notFound")}</p>
                <Button variant="gold" className="mt-4 rounded-full" asChild>
                  <Link href="/products">{t("thankYou.shopMore")}</Link>
                </Button>
              </div>
            )}

            {hydrated && order && (
              <>
                <ThankYouVerification
                  order={order}
                  onCustomerUpdate={handleCustomerUpdate}
                />

                <div className="glass-card mt-8 rounded-2xl border border-border/60 p-6 text-start shadow-warm-lg">
                  <p className="text-xs font-bold uppercase tracking-wider text-accent">
                    {t("thankYou.summary")}
                  </p>
                  <p className="mt-1 font-mono text-sm text-muted-foreground">
                    {order.id}
                  </p>
                  <ul className="mt-4 space-y-3 border-t border-border/50 pt-4">
                    {order.items.map((item, i) => (
                      <li
                        key={`${item.nameAr}-${i}`}
                        className="flex justify-between gap-4 text-sm"
                      >
                        <span className="text-foreground">
                          {item.nameAr} × {item.quantity}
                          <span className="mt-0.5 block text-xs text-muted-foreground">
                            {item.offerLabel}
                          </span>
                        </span>
                        <span className="shrink-0 font-bold tabular-nums text-accent">
                          {item.unitPrice * item.quantity} {t("common.currency")}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 space-y-2 border-t border-border/50 pt-4 text-sm">
                    <div className="flex justify-between gap-4">
                      <span className="text-muted-foreground">{t("common.subtotal")}</span>
                      <span className="font-bold tabular-nums">
                        {order.subtotal} {t("common.currency")}
                      </span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-muted-foreground">
                        <span className="block">
                          {order.shippingLabelFr ?? "Livraison gratuite"}
                        </span>
                        <span className="mt-0.5 block text-2xs">
                          {order.shippingLabelAr ?? t("common.shipping")}
                        </span>
                      </span>
                      <span
                        className={
                          (order.shippingFee ?? 0) === 0
                            ? "font-bold text-emerald-600"
                            : "font-bold tabular-nums"
                        }
                      >
                        {(order.shippingFee ?? 0) === 0
                          ? t("common.free")
                          : `${order.shippingFee} ${t("common.currency")}`}
                      </span>
                    </div>
                    <div className="flex justify-between gap-4 border-t border-border/40 pt-2 text-base font-bold">
                      <span>{t("common.total")}</span>
                      <span className="text-accent">
                        {order.total ?? order.subtotal} {t("common.currency")}
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button
                variant="gold"
                size="lg"
                className="gap-2 rounded-full px-8 shadow-gold"
                asChild
              >
                <Link href="/products">
                  <ShoppingBag className="size-5" />
                  {t("thankYou.shopAgain")}
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="gap-2 rounded-full px-8"
                asChild
              >
                <Link href="/">
                  <Home className="size-5" />
                  {t("thankYou.home")}
                </Link>
              </Button>
            </div>
          </div>
        </Container>
      </Section>

      {allProducts.length > 0 && (
        <Section spacing="lg" bg="alt">
          <Container>
            <motion.div
              variants={staggerContainer}
              initial={false}
              whileInView="visible"
              viewport={VIEWPORT}
            >
              <motion.div variants={staggerItem}>
                <h2 className="text-display mb-2 text-center text-2xl text-foreground">
                  {t("thankYou.recommended")}
                </h2>
              </motion.div>
              <motion.div variants={staggerItem}>
                <p className="mb-8 text-center text-sm text-muted-foreground">
                  {t("thankYou.recommendedSub")}
                </p>
              </motion.div>
              <motion.div
                variants={staggerContainer}
                className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              >
                {allProducts.map((product) => (
                  <motion.div key={product.id} variants={staggerItem}>
                    <CatalogProductCard
                      product={product}
                      showAddToCart={false}
                    />
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </Container>
        </Section>
      )}
    </>
  );
}
