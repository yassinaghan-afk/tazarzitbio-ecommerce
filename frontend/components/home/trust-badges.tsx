"use client";

import { motion } from "framer-motion";
import { Leaf, MapPin, Package, ShieldCheck, Truck } from "lucide-react";

import { Container } from "@/components/layout/container";
import { staggerContainer, staggerItem, VIEWPORT } from "@/lib/animations";

const badges = [
  {
    icon: Leaf,
    title: "طبيعي 100%",
    desc:  "بدون إضافات",
  },
  {
    icon: MapPin,
    title: "من قلب سوس",
    desc:  "أصالة مغربية",
  },
  {
    icon: ShieldCheck,
    title: "الدفع عند الاستلام",
    desc:  "بدون مخاطرة",
  },
  {
    icon: Package,
    title: "تغليف محكم",
    desc:  "جاهز للإهداء",
  },
  {
    icon: Truck,
    title: "توصيل سريع",
    desc:  "جميع المدن",
  },
];

export function TrustBadges() {
  return (
    <div className="border-y border-border bg-card">
      <Container>
        <motion.ul
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT}
          className="flex flex-wrap items-center justify-center gap-x-8 gap-y-5 py-6 md:justify-between"
        >
          {badges.map((badge) => (
            <motion.li
              key={badge.title}
              variants={staggerItem}
              className="flex items-center gap-3"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent/10">
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
