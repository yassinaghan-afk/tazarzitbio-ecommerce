"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, ShoppingBag } from "lucide-react";

import { Container, Section } from "@/components/layout/container";
import {
  fadeUp,
  staggerContainer,
  staggerItem,
  VIEWPORT,
} from "@/lib/animations";
import { Button } from "@/components/ui/button";

export function CtaSection() {
  return (
    <Section
      spacing="xl"
      className="texture-grain relative overflow-hidden bg-brown-gradient text-primary-foreground"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -end-20 -top-20 h-96 w-96 rounded-full bg-accent/15 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-16 -start-16 h-72 w-72 rounded-full bg-white/5 blur-2xl"
      />

      <Container size="md" className="relative z-10">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT}
          className="flex flex-col items-center gap-8 text-center"
        >
          <motion.p
            variants={staggerItem}
            className="text-sm font-semibold uppercase tracking-[0.2em] text-white/50"
          >
            ابدأ رحلتك مع سوس
          </motion.p>

          <motion.h2
            variants={fadeUp}
            className="text-3xl font-extrabold leading-tight text-white md:text-5xl lg:text-6xl"
          >
            جرّب الطبيعة
            <br />
            <span className="text-gold-gradient">كما يجب أن تكون</span>
          </motion.h2>

          <motion.p
            variants={staggerItem}
            className="max-w-lg text-base leading-relaxed text-white/75 md:text-lg"
          >
            أكثر من ٢٠٠٠ عميل اختاروا تازارزيت بيو. اطلب الآن — الدفع عند
            الاستلام، توصيل لجميع مدن المغرب، وضمان جودة في كل عبوة.
          </motion.p>

          <motion.div
            variants={staggerItem}
            className="flex flex-wrap justify-center gap-4"
          >
            <Button variant="gold" size="xl" className="min-h-12 gap-2 shadow-gold" asChild>
              <Link href="/products">
                <ShoppingBag className="size-5" />
                اطلب الآن
              </Link>
            </Button>
            <Button variant="light" size="xl" className="min-h-12 gap-2" asChild>
              <Link href="/products">
                تصفح المنتجات
                <ArrowLeft className="size-5" />
              </Link>
            </Button>
          </motion.div>

          <motion.ul
            variants={staggerItem}
            className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-white/60"
          >
            {[
              "لا دفع مسبق",
              "توصيل سريع",
              "طبيعي 100%",
              "من قلب سوس",
              "ضمان الجودة",
            ].map((item) => (
              <li key={item} className="flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-accent" />
                {item}
              </li>
            ))}
          </motion.ul>
        </motion.div>
      </Container>
    </Section>
  );
}
