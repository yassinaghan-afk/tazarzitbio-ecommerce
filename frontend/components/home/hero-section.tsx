"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Award, ShieldCheck, ShoppingBag, Truck } from "lucide-react";

import { Container } from "@/components/layout/container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  heroImage,
  heroText,
  staggerContainer,
  staggerItem,
} from "@/lib/animations";

const showcaseProducts = [
  {
    emoji: "🫙",
    name: "أملو فاخر",
    price: "89 د.م.",
    gradient: "from-amber-100 via-orange-50 to-amber-50",
    className: "col-span-2 row-span-2",
    large: true,
  },
  {
    emoji: "✨",
    name: "زيت أركان",
    price: "149 د.م.",
    gradient: "from-yellow-50 to-amber-100",
    className: "",
  },
  {
    emoji: "🍯",
    name: "عسل سوس",
    price: "75 د.م.",
    gradient: "from-amber-50 to-yellow-100",
    className: "",
  },
];

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
        className="pointer-events-none absolute -top-40 end-[-10%] h-[min(600px,80vw)] w-[min(600px,80vw)] rounded-full bg-[radial-gradient(circle,hsl(40_80%_55%/0.2)_0%,transparent_70%)] blur-2xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 start-[-5%] h-80 w-80 rounded-full bg-[radial-gradient(circle,hsl(96_33%_22%/0.12)_0%,transparent_70%)] blur-2xl"
      />

      <Container className="relative z-[2] grid items-center gap-14 pb-20 pt-32 md:grid-cols-[1fr_1.05fr] md:gap-12 md:pb-28 md:pt-36 lg:pt-40">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="flex flex-col gap-8 md:gap-9"
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

          <motion.div variants={staggerItem} className="flex flex-wrap gap-3">
            <Button
              variant="gold"
              size="xl"
              className="min-w-[11rem] gap-2 rounded-full px-8 shadow-gold"
            >
              <ShoppingBag className="size-5" strokeWidth={2} />
              اكتشف المجموعة
            </Button>
            <Button
              variant="outline"
              size="xl"
              className="gap-2 rounded-full border-foreground/15 bg-card/50 px-8 backdrop-blur-sm"
            >
              قصتنا
              <ArrowLeft className="size-5" />
            </Button>
          </motion.div>

          <motion.ul
            variants={staggerItem}
            className="flex flex-wrap gap-3"
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

        {/* Premium product showcase */}
        <motion.div
          variants={heroImage}
          initial="hidden"
          animate="visible"
          className="relative mx-auto w-full max-w-lg"
        >
          <div className="ambient-glow absolute inset-0 rounded-[2rem]" aria-hidden />

          <div className="relative grid grid-cols-2 gap-3 p-2 sm:gap-4">
            {showcaseProducts.map((p, i) => (
              <motion.div
                key={p.name}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.35 + i * 0.12,
                  duration: 0.6,
                  ease: [0.22, 1, 0.36, 1],
                }}
                whileHover={{ y: -6, transition: { duration: 0.25 } }}
                className={`frame-premium relative overflow-hidden rounded-2xl bg-gradient-to-br ${p.gradient} ${p.className} ${p.large ? "min-h-[280px] sm:min-h-[320px]" : "aspect-square"}`}
              >
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,hsl(0_0%_100%/0.35),transparent_50%)]" />
                <div className="relative z-[2] flex h-full flex-col items-center justify-center gap-2 p-4 text-center">
                  <span
                    className={p.large ? "text-7xl sm:text-8xl" : "text-4xl sm:text-5xl"}
                    aria-hidden
                  >
                    {p.emoji}
                  </span>
                  <p className="text-sm font-bold text-foreground/85">{p.name}</p>
                  <p className="text-sm font-bold tabular-nums text-accent">
                    {p.price}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.5 }}
            className="glass-card absolute -bottom-5 -start-2 z-10 rounded-2xl p-5 md:-start-6"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold-gradient text-lg font-bold text-foreground shadow-gold">
                4.9
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">+2000 عميل</p>
                <p className="text-xs text-muted-foreground">يثقون بجودتنا</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="glass-card absolute -end-2 top-8 z-10 rounded-full px-4 py-2 md:-end-4"
          >
            <p className="text-xs font-semibold text-primary">🌿 طبيعي 100%</p>
          </motion.div>
        </motion.div>
      </Container>

      <div className="section-divider relative z-[2] mx-auto max-w-4xl" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background via-background/80 to-transparent" />
    </section>
  );
}
