"use client";

import { motion } from "framer-motion";
import { Leaf, MapPin, Package, ShieldCheck, Truck } from "lucide-react";

import { Container } from "@/components/layout/container";
import { staggerContainer, staggerItem, VIEWPORT } from "@/lib/animations";

const badges = [
  { icon: Leaf,        title: "طبيعي 100%",         desc: "بدون إضافات" },
  { icon: MapPin,      title: "من قلب سوس",         desc: "أصالة مغربية" },
  { icon: ShieldCheck, title: "الدفع عند الاستلام", desc: "بدون مخاطرة" },
  { icon: Package,     title: "تغليف فاخر",         desc: "جاهز للإهداء" },
  { icon: Truck,       title: "توصيل لجميع المدن",  desc: "سريع وموثوق" },
];

export function TrustBadges() {
  return (
    <div className="relative z-20 -mt-6 border-y border-border/80 bg-card/95 shadow-warm-sm backdrop-blur-md">
      <Container>
        <motion.ul
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT}
          className="flex snap-x snap-mandatory gap-6 overflow-x-auto py-5 scrollbar-hide md:grid md:grid-cols-5 md:overflow-visible md:py-6"
        >
          {badges.map((badge) => (
            <motion.li
              key={badge.title}
              variants={staggerItem}
              className="flex min-w-[140px] shrink-0 snap-start items-center gap-3 md:min-w-0 md:justify-center md:flex-col md:text-center"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 md:h-11 md:w-11">
                <badge.icon className="size-5 text-accent" aria-hidden />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">{badge.title}</p>
                <p className="text-xs text-muted-foreground">{badge.desc}</p>
              </div>
            </motion.li>
          ))}
        </motion.ul>
      </Container>
    </div>
  );
}
