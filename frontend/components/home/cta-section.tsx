"use client";

import { motion } from "framer-motion";
import { ShoppingBag } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Container, Section } from "@/components/layout/container";
import { fadeUp, staggerContainer, staggerItem, VIEWPORT } from "@/lib/animations";

export function CtaSection() {
  return (
    <Section spacing="xl" className="relative overflow-hidden bg-olive-gradient text-primary-foreground">
      {/* Decorative blobs */}
      <div
        aria-hidden
        className="pointer-events-none absolute -end-24 -top-24 h-80 w-80 rounded-full bg-white/5 blur-2xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -start-12 bottom-0 h-60 w-60 rounded-full bg-accent/10 blur-2xl"
      />

      <Container size="md" className="relative z-10">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT}
          className="flex flex-col items-center gap-6 text-center"
        >
          <motion.p
            variants={staggerItem}
            className="text-sm font-semibold uppercase tracking-widest text-white/60"
          >
            الدفع عند الاستلام · توصيل لجميع المدن
          </motion.p>

          <motion.h2
            variants={fadeUp}
            className="text-3xl font-bold leading-tight text-white md:text-5xl"
          >
            جرّب الجودة الحقيقية
            <br />
            <span className="text-gold-gradient">من قلب سوس</span>
          </motion.h2>

          <motion.p
            variants={staggerItem}
            className="max-w-lg text-base leading-relaxed text-white/75"
          >
            أكثر من ٢٠٠٠ عميل وثق في تازارزيت بيو. اطلب الآن بدون أي دفع
            مسبق — تدفع نقداً عند استلام طلبك.
          </motion.p>

          <motion.div
            variants={staggerItem}
            className="flex flex-wrap justify-center gap-3"
          >
            <Button variant="gold" size="xl" className="gap-2 shadow-gold">
              <ShoppingBag className="size-5" />
              اطلب الآن — الدفع عند الاستلام
            </Button>
            <Button variant="light" size="xl">
              اكتشف المجموعة الكاملة
            </Button>
          </motion.div>

          {/* Mini trust row */}
          <motion.div
            variants={staggerItem}
            className="flex flex-wrap justify-center gap-6 pt-2"
          >
            {[
              "✓ لا دفع مسبق",
              "✓ توصيل سريع",
              "✓ طبيعي 100%",
              "✓ ضمان الجودة",
            ].map((t) => (
              <span key={t} className="text-sm text-white/70">
                {t}
              </span>
            ))}
          </motion.div>
        </motion.div>
      </Container>
    </Section>
  );
}
