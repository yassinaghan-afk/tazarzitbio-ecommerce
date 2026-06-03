"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Award, ShieldCheck, ShoppingBag, Truck } from "lucide-react";

import { HeroBundleImage } from "@/components/home/hero-bundle-image";
import { Container } from "@/components/layout/container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  heroImage,
  heroText,
  staggerContainer,
  staggerItem,
} from "@/lib/animations";

const trustPills = [
  { icon: ShieldCheck, text: "طبيعي 100%" },
  { icon: Truck, text: "الدفع عند الاستلام" },
  { icon: Award, text: "4.9 تقييم العملاء" },
];

export function HeroSection() {
  return (
    <section
      className="texture-grain relative min-h-[94vh] overflow-hidden bg-hero-premium"
      aria-label="الصفحة الرئيسية"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 end-0 h-[min(600px,80vw)] w-[min(600px,80vw)] max-w-full rounded-full bg-[radial-gradient(circle,hsl(40_80%_55%/0.2)_0%,transparent_70%)] blur-2xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 start-0 h-80 w-80 max-w-full rounded-full bg-[radial-gradient(circle,hsl(96_33%_22%/0.12)_0%,transparent_70%)] blur-2xl"
      />

      <Container className="relative z-[2] flex flex-col gap-8 pb-20 pt-24 sm:gap-10 md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,1.12fr)] md:items-center md:gap-12 md:pb-28 md:pt-36 lg:pt-40">
        {/* Bundle visual — dominant, above copy on mobile */}
        <motion.div
          variants={heroImage}
          initial="hidden"
          animate="visible"
          className="order-1 relative w-full md:order-2"
        >
          <HeroBundleImage className="mx-auto max-w-[min(100%,26rem)] sm:max-w-[28rem] md:ms-auto md:max-w-none" />

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.85, duration: 0.5 }}
            className="glass-card absolute -bottom-2 start-2 z-10 max-w-[calc(100%-1rem)] rounded-2xl p-3.5 shadow-warm-lg sm:-bottom-4 sm:start-0 sm:max-w-none sm:p-4 md:-start-4 md:p-5"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold-gradient text-sm font-bold text-foreground shadow-gold sm:h-11 sm:w-11 sm:text-base md:h-12 md:w-12 md:text-lg">
                4.9
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">+2000 عميل</p>
                <p className="text-xs text-muted-foreground">يثقون بجودتنا</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.95, duration: 0.45 }}
            className="glass-card absolute end-2 top-4 z-10 max-w-[calc(100%-1rem)] rounded-full px-3 py-1.5 md:end-2 md:top-8 md:px-4 md:py-2"
          >
            <p className="text-[0.65rem] font-semibold text-primary sm:text-xs">
              باقة عائلية — قيمة ممتازة
            </p>
          </motion.div>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="order-2 flex flex-col gap-6 sm:gap-7 md:order-1 md:gap-9"
        >
          <motion.div variants={staggerItem}>
            <Badge
              variant="premium"
              className="gap-2 border-accent/25 px-4 py-2 text-sm shadow-warm-sm"
            >
              <span aria-hidden>🌿</span>
              من قلب سوس · حرفية مغربية أصيلة
            </Badge>
          </motion.div>

          <motion.div variants={heroText} className="space-y-4">
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-accent">
              Tazarzit Bio
            </p>
            <h1 className="text-display text-4xl text-foreground sm:text-5xl lg:text-[3.5rem]">
              <span className="block text-gold-gradient">طعم سوس</span>
              <span className="mt-2 block font-bold text-foreground/90">
                في أبهى صورة
              </span>
            </h1>
            <p className="max-w-md text-lg leading-[1.8] text-muted-foreground md:text-xl">
              أملو، زيت أركان، وعسل نقي — منتجات طبيعية 100% تحمل دفء المغرب
              وفخامة الحرف اليدوية إلى مائدتك.
            </p>
          </motion.div>

          <motion.div
            variants={staggerItem}
            className="flex flex-wrap gap-3 md:flex"
          >
            <Button
              variant="gold"
              size="xl"
              className="min-h-[3rem] flex-1 gap-2 rounded-full px-6 shadow-gold sm:flex-none sm:px-8"
              asChild
            >
              <Link href="/products">
                <ShoppingBag className="size-5" strokeWidth={2} />
                اكتشف المجموعة
              </Link>
            </Button>
            <Button
              variant="outline"
              size="xl"
              className="min-h-[3rem] gap-2 rounded-full border-foreground/15 bg-card/50 px-6 backdrop-blur-sm sm:px-8"
              asChild
            >
              <Link href="/#story">
                قصتنا
                <ArrowLeft className="size-5" />
              </Link>
            </Button>
          </motion.div>

          <motion.ul
            variants={staggerItem}
            className="hidden flex-wrap gap-3 md:flex"
          >
            {trustPills.map(({ icon: Icon, text }) => (
              <li
                key={text}
                className="glass-card flex items-center gap-2.5 rounded-full px-4 py-2.5 text-sm font-medium text-foreground/85"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/10">
                  <Icon className="size-4 text-accent" strokeWidth={2} />
                </span>
                {text}
              </li>
            ))}
          </motion.ul>
        </motion.div>

        <ul className="order-3 flex flex-wrap gap-2.5 md:hidden">
          {trustPills.map(({ icon: Icon, text }) => (
            <li
              key={text}
              className="glass-card flex items-center gap-2 rounded-full px-3 py-2 text-xs font-medium text-foreground/85"
            >
              <Icon className="size-3.5 shrink-0 text-accent" strokeWidth={2} />
              {text}
            </li>
          ))}
        </ul>
      </Container>

      <div className="section-divider relative z-[2] mx-auto max-w-4xl" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background via-background/80 to-transparent" />
    </section>
  );
}
