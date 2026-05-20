"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle2, Heart, Home, Phone, ShoppingBag, Sparkles } from "lucide-react";

import { CatalogProductCard } from "@/components/catalog/catalog-product-card";
import { Container, Section } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { useCatalogProducts } from "@/hooks/use-catalog";
import { fadeUp, staggerContainer, staggerItem, VIEWPORT } from "@/lib/animations";
import type { PlacedOrder } from "@/lib/checkout/types";
import { LAST_ORDER_STORAGE_KEY } from "@/lib/checkout/types";
import { formatMoroccanPhoneDisplay } from "@/lib/checkout/validation";

export default function ThankYouPage() {
  const [order, setOrder] = useState<PlacedOrder | null>(null);
  const products = useCatalogProducts();

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(LAST_ORDER_STORAGE_KEY);
      if (raw) setOrder(JSON.parse(raw) as PlacedOrder);
    } catch {
      setOrder(null);
    }
  }, []);

  const recommended = useMemo(() => products.slice(0, 3), [products]);

  return (
    <>
      <Section spacing="lg" className="texture-grain">
        <Container className="max-w-2xl">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="text-center"
          >
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
              <span className="text-sm font-bold">بارك الله فيك</span>
              <Heart className="size-4 fill-accent/30 text-accent" />
            </div>

            <h1 className="text-display text-3xl text-foreground sm:text-4xl">
              شكراً من قلب سوس
            </h1>
            <p className="mx-auto mt-5 max-w-lg text-base leading-[1.9] text-muted-foreground sm:text-lg">
              استلمنا طلبك بعناية.{" "}
              <strong className="font-bold text-foreground">
                سيتصل بك فريق تازارزيت بيو خلال ساعات قليلة
              </strong>{" "}
              لتأكيد الطلب والعنوان قبل الشحن — دون أي دفع مسبق.
            </p>

            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-accent/25 bg-accent/5 px-4 py-2 text-sm text-foreground/85">
              <Phone className="size-4 text-accent" />
              تأكد من أن هاتفك مفعّل — نحن بانتظارك
            </div>

            {order && (
              <div className="glass-card mt-10 rounded-2xl border border-border/60 p-6 text-start shadow-warm-lg">
                <p className="text-xs font-bold uppercase tracking-wider text-accent">
                  ملخص طلبك
                </p>
                <p className="mt-1 font-mono text-sm text-muted-foreground">
                  {order.id}
                </p>
                <ul className="mt-4 space-y-3 border-t border-border/50 pt-4">
                  {order.items.map((item, i) => (
                    <li
                      key={i}
                      className="flex justify-between gap-4 text-sm"
                    >
                      <span className="text-foreground">
                        {item.nameAr} × {item.quantity}
                        <span className="mt-0.5 block text-xs text-muted-foreground">
                          {item.offerLabel}
                        </span>
                      </span>
                      <span className="shrink-0 font-bold tabular-nums text-accent">
                        {item.unitPrice * item.quantity} د.م.
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 space-y-2 border-t border-border/50 pt-4 text-sm">
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">المجموع الفرعي</span>
                    <span className="font-bold tabular-nums">{order.subtotal} د.م.</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">
                      <span className="block">
                        {order.shippingLabelFr ?? "Livraison"}
                      </span>
                      <span className="mt-0.5 block text-2xs">التوصيل</span>
                    </span>
                    <span
                      className={
                        (order.shippingFee ?? 0) === 0
                          ? "font-bold text-emerald-600"
                          : "font-bold tabular-nums"
                      }
                    >
                      {(order.shippingFee ?? 0) === 0
                        ? "مجاني"
                        : `${order.shippingFee} د.م.`}
                    </span>
                  </div>
                  <div className="flex justify-between gap-4 border-t border-border/40 pt-2 text-base font-bold">
                    <span>الإجمالي</span>
                    <span className="text-accent">
                      {order.total ?? order.subtotal} د.م.
                    </span>
                  </div>
                </div>
                <div className="mt-4 space-y-1 border-t border-border/40 pt-4 text-sm text-muted-foreground">
                  <p className="font-semibold text-foreground">
                    {order.customer.fullName}
                  </p>
                  <p dir="ltr" className="text-end tabular-nums">
                    {formatMoroccanPhoneDisplay(order.customer.phone)}
                  </p>
                  <p className="leading-relaxed">{order.customer.address}</p>
                </div>
              </div>
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
                  تسوق أكثر
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
                  العودة للرئيسية
                </Link>
              </Button>
            </div>
          </motion.div>
        </Container>
      </Section>

      {recommended.length > 0 && (
        <Section spacing="lg" bg="alt">
          <Container>
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={VIEWPORT}
            >
              <motion.div variants={staggerItem}>
                <h2 className="text-display mb-2 text-center text-2xl text-foreground">
                  قد يعجبك أيضاً
                </h2>
              </motion.div>
              <motion.div variants={staggerItem}>
                <p className="mb-10 text-center text-sm text-muted-foreground">
                  منتجات طبيعية من سوس — نفس الجودة التي اخترتها
                </p>
              </motion.div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {recommended.map((product) => (
                  <motion.div key={product.id} variants={staggerItem}>
                    <CatalogProductCard product={product} />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </Container>
        </Section>
      )}
    </>
  );
}
