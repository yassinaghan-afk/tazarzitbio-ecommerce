"use client";

import { motion } from "framer-motion";
import { ArrowLeft, ShoppingBag } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import {
  heroImage,
  heroText,
  staggerContainer,
  staggerItem,
} from "@/lib/animations";

const heroProducts = [
  { emoji: "🫙", label: "أملو تازارزيت", price: "89 د.م.",  gradient: "from-amber-100 to-orange-100" },
  { emoji: "✨", label: "زيت أركان",     price: "149 د.م.", gradient: "from-yellow-100 to-amber-100" },
  { emoji: "🍯", label: "عسل طبيعي",    price: "75 د.م.",  gradient: "from-yellow-50 to-amber-50"  },
  { emoji: "🎁", label: "علبة هدية",    price: "249 د.م.", gradient: "from-emerald-50 to-green-100" },
];

export function HeroSection() {
  return (
    <section
      className="relative min-h-[90vh] overflow-hidden bg-cream-gradient pt-20 md:pt-24"
      aria-label="قسم الترحيب"
    >
      {/* Decorative blobs */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 end-0 h-[500px] w-[500px] rounded-full bg-accent/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 start-0 h-[300px] w-[300px] rounded-full bg-primary/8 blur-2xl"
      />

      <Container className="relative z-10 flex flex-col gap-14 py-16 md:flex-row md:items-center md:py-20 lg:py-28">
        {/* ── Text column ─────────────────────────────── */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="flex flex-1 flex-col gap-6 md:max-w-lg"
        >
          <motion.div variants={staggerItem}>
            <Badge variant="premium" className="gap-2">
              <span aria-hidden>🌿</span>
              100% طبيعي · من قلب المغرب
            </Badge>
          </motion.div>

          <motion.h1
            variants={heroText}
            className="text-5xl font-bold leading-tight text-foreground md:text-6xl lg:text-7xl"
          >
            <span className="block text-gold-gradient">تازارزيت</span>
            <span className="block">بيو</span>
          </motion.h1>

          <motion.p
            variants={staggerItem}
            className="text-xl font-medium text-foreground/70 md:text-2xl"
          >
            100% طبيعي من قلب سوس
          </motion.p>

          <motion.p
            variants={staggerItem}
            className="max-w-sm text-base leading-relaxed text-muted-foreground"
          >
            أملو، زيت أركان، عسل، ومكسرات مختارة بعناية من منطقة سوس.
            جودة فاخرة، تغليف أنيق، والدفع عند الاستلام في جميع أنحاء المغرب.
          </motion.p>

          <motion.div
            variants={staggerItem}
            className="flex flex-wrap gap-3"
          >
            <Button variant="gold" size="xl" className="gap-2">
              <ShoppingBag className="size-5" />
              تسوق الآن
            </Button>
            <Button variant="outline" size="xl" className="gap-2">
              اكتشف مجموعتنا
              <ArrowLeft className="size-5" />
            </Button>
          </motion.div>

          {/* Mini trust row */}
          <motion.div
            variants={staggerItem}
            className="flex flex-wrap gap-4 pt-2"
          >
            {["الدفع عند الاستلام", "توصيل للمغرب", "طبيعي 100%"].map((t) => (
              <span
                key={t}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground/60"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                {t}
              </span>
            ))}
          </motion.div>
        </motion.div>

        {/* ── Visual column ────────────────────────────── */}
        <motion.div
          variants={heroImage}
          initial="hidden"
          animate="visible"
          className="relative flex flex-1 justify-center md:justify-end"
        >
          {/* Background circle */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-[340px] w-[340px] rounded-full bg-gradient-to-br from-accent/20 to-amber-100/40 blur-sm md:h-[420px] md:w-[420px]" />
          </div>

          {/* Product grid */}
          <div className="relative grid grid-cols-2 gap-3 sm:gap-4">
            {heroProducts.map((p, i) => (
              <motion.div
                key={p.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 + i * 0.1, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className={`flex flex-col items-center gap-2 rounded-2xl border border-white/60 bg-gradient-to-br ${p.gradient} p-4 shadow-warm-md backdrop-blur-sm sm:p-5`}
              >
                <span className="text-3xl sm:text-4xl" aria-hidden>{p.emoji}</span>
                <span className="text-center text-xs font-semibold text-foreground/80 sm:text-sm">
                  {p.label}
                </span>
                <span className="text-sm font-bold tabular-nums text-accent">
                  {p.price}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </Container>

      {/* Bottom gradient fade */}
      <div className="pointer-events-none absolute bottom-0 inset-x-0 h-20 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
