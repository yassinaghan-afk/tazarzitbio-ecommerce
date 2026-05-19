"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle2, MessageCircle, Phone, Truck } from "lucide-react";

import { Container, Section } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { fadeUp } from "@/lib/animations";
import type { PlacedOrder } from "@/lib/checkout/types";
import { LAST_ORDER_STORAGE_KEY } from "@/lib/checkout/types";
import { formatMoroccanPhoneDisplay } from "@/lib/checkout/validation";

export default function ThankYouPage() {
  const [order, setOrder] = useState<PlacedOrder | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(LAST_ORDER_STORAGE_KEY);
      if (raw) setOrder(JSON.parse(raw) as PlacedOrder);
    } catch {
      setOrder(null);
    }
  }, []);

  return (
    <Section spacing="lg" className="texture-grain min-h-[70vh]">
      <Container className="max-w-xl">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="text-center"
        >
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 shadow-warm-md ring-1 ring-emerald-200">
            <CheckCircle2 className="size-10 text-emerald-600" />
          </div>

          <h1 className="text-display text-3xl text-foreground sm:text-4xl">
            شكراً لثقتك
          </h1>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            تم استلام طلبك بنجاح. فريق تازارزيت بيو سيتصل بك قريباً لتأكيد
            العنوان وموعد التوصيل قبل الشحن.
          </p>

          {order && (
            <div className="glass-card mt-8 rounded-2xl border border-border/60 p-6 text-start shadow-warm-md">
              <p className="text-xs font-bold uppercase tracking-wider text-accent">
                ملخص الطلب
              </p>
              <p className="mt-2 font-mono text-sm text-muted-foreground">
                {order.id}
              </p>
              <ul className="mt-4 space-y-2 border-t border-border/50 pt-4">
                {order.items.map((item, i) => (
                  <li
                    key={i}
                    className="flex justify-between gap-4 text-sm"
                  >
                    <span className="text-foreground">
                      {item.nameAr} × {item.quantity}
                      <span className="block text-xs text-muted-foreground">
                        {item.offerLabel}
                      </span>
                    </span>
                    <span className="shrink-0 font-bold tabular-nums text-accent">
                      {item.unitPrice * item.quantity} د.م.
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex justify-between border-t border-border/50 pt-4 font-bold">
                <span>المجموع</span>
                <span className="text-accent">{order.subtotal} د.م.</span>
              </div>
              <div className="mt-4 space-y-1 text-sm text-muted-foreground">
                <p>{order.customer.fullName}</p>
                <p dir="ltr" className="text-end">
                  {formatMoroccanPhoneDisplay(order.customer.phone)}
                </p>
                <p>
                  {order.customer.city} — {order.customer.address}
                </p>
              </div>
            </div>
          )}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <div className="flex items-center justify-center gap-2 rounded-xl bg-secondary/60 px-4 py-3 text-sm">
              <Phone className="size-4 text-accent" />
              سنتصل بك للتأكيد
            </div>
            <div className="flex items-center justify-center gap-2 rounded-xl bg-secondary/60 px-4 py-3 text-sm">
              <Truck className="size-4 text-accent" />
              الدفع عند الاستلام
            </div>
          </div>

          <Button
            variant="outline"
            size="lg"
            className="mt-6 w-full gap-2 rounded-full sm:w-auto"
            asChild
          >
            <a href="https://wa.me/212600000000" target="_blank" rel="noopener noreferrer">
              <MessageCircle className="size-5" />
              تواصل عبر واتساب (قريباً)
            </a>
          </Button>

          <Button variant="gold" className="mt-4 w-full rounded-full shadow-gold sm:w-auto" asChild>
            <Link href="/products">متابعة التسوق</Link>
          </Button>
        </motion.div>
      </Container>
    </Section>
  );
}
