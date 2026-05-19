"use client";

import { motion } from "framer-motion";
import { ArrowLeft, ShieldCheck, ShoppingBag, Truck } from "lucide-react";

import { Container } from "@/components/layout/container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlaceholderImage } from "@/components/ui/placeholder-image";
import {
  heroImage,
  heroText,
  staggerContainer,
  staggerItem,
} from "@/lib/animations";

const trustPills = [
  { icon: ShieldCheck, text: "طبيعي 100%" },
  { icon: Truck,        text: "الدفع عند الاستلام" },
  { icon: ShoppingBag,  text: "توصيل لجميع المدن" },
];

export function HeroSection() {
  return (
    <section
      className="relative min-h-[92vh] overflow-hidden bg-cream-gradient"
      aria-label="الصفحة الرئيسية"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 end-0 h-[560px] w-[560px] rounded-full bg-accent/12 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 start-0 h-72 w-72 rounded-full bg-primary/10 blur-3xl"
      />

      <Container className="relative z-10 grid items-center gap-12 pb-16 pt-28 md:grid-cols-2 md:gap-16 md:pb-24 md:pt-32 lg:pt-36">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="flex flex-col gap-7"
        >
          <motion.div variants={staggerItem}>
            <Badge variant="premium" className="gap-2 px-4 py-1.5 text-sm">
              <span aria-hidden>🌿</span>
              من قلب سوس · المغرب الأصيل
            </Badge>
          </motion.div>

          <motion.div variants={heroText} className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-accent">
              تازارزيت بيو
            </p>
            <h1 className="text-4xl font-extrabold leading-[1.15] text-foreground sm:text-5xl lg:text-6xl">
              <span className="block text-gold-gradient">طعم سوس</span>
              <span className="block mt-1">في كل لقمة</span>
            </h1>
            <p className="max-w-md text-lg font-medium leading-relaxed text-muted-foreground md:text-xl">
              100% طبيعي من قلب سوس — أملو فاخر، زيت أركان، وعسل نقي
              يحمل روح المغرب إلى مائدتك.
            </p>
          </motion.div>

          <motion.div variants={staggerItem} className="flex flex-wrap gap-3">
            <Button variant="gold" size="xl" className="gap-2 shadow-gold">
              <ShoppingBag className="size-5" />
              اكتشف مجموعتنا
            </Button>
            <Button variant="outline" size="xl" className="gap-2">
              قصتنا من سوس
              <ArrowLeft className="size-5" />
            </Button>
          </motion.div>

          <motion.ul
            variants={staggerItem}
            className="flex flex-wrap gap-4 pt-2"
          >
            {trustPills.map(({ icon: Icon, text }) => (
              <li
                key={text}
                className="flex items-center gap-2 rounded-full border border-border/80 bg-card/80 px-4 py-2 text-sm font-medium text-foreground/80 shadow-warm-sm backdrop-blur-sm"
              >
                <Icon className="size-4 text-accent" aria-hidden />
                {text}
              </li>
            ))}
          </motion.ul>
        </motion.div>

        <motion.div
          variants={heroImage}
          initial="hidden"
          animate="visible"
          className="relative"
        >
          <PlaceholderImage
            emoji="🫒"
            label="منتجات طبيعية من سوس"
            sublabel="تصوير احترافي قريباً"
            gradient="from-amber-100 via-orange-50 to-yellow-50"
            aspect="portrait"
            size="lg"
            className="mx-auto w-full max-w-md shadow-warm-xl"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="absolute -bottom-4 -start-4 rounded-2xl border border-border bg-card p-4 shadow-warm-lg md:-start-8"
          >
            <p className="text-2xs font-semibold uppercase tracking-wider text-muted-foreground">
              تقييم العملاء
            </p>
            <p className="text-2xl font-bold text-accent">4.9 ★</p>
            <p className="text-xs text-muted-foreground">+2000 عميل سعيد</p>
          </motion.div>
        </motion.div>
      </Container>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
