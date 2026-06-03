"use client";

import { motion } from "framer-motion";
import {
  BadgeCheck,
  Leaf,
  MapPin,
  Package,
  ShieldCheck,
  Truck,
} from "lucide-react";

import { Container } from "@/components/layout/container";
import { useTranslation } from "@/lib/i18n/language-provider";
import { getTrustBadges } from "@/lib/i18n/home-content";
import { staggerContainer, staggerItem, VIEWPORT } from "@/lib/animations";

const TRUST_ICONS = [Leaf, MapPin, ShieldCheck, Package, Truck, BadgeCheck];

export function TrustBadges() {
  const { t } = useTranslation();
  const badges = getTrustBadges(t).map((badge, i) => ({
    ...badge,
    icon: TRUST_ICONS[i]!,
  }));

  return (
    <motion.div
      className="relative z-20 -mt-8 md:-mt-10"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={VIEWPORT}
      transition={{ duration: 0.5 }}
    >
      <Container>
        <div className="glass-surface overflow-hidden rounded-2xl shadow-warm-lg md:rounded-3xl">
          <motion.ul
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT}
            className="flex snap-x snap-mandatory gap-0 overflow-x-auto scrollbar-hide md:grid md:grid-cols-6 md:overflow-visible"
          >
            {badges.map((badge) => (
              <motion.li
                key={badge.title}
                variants={staggerItem}
                className="flex min-w-[9.5rem] shrink-0 snap-start flex-col items-center gap-2 border-e border-border/40 px-4 py-6 text-center last:border-e-0 md:min-w-0 md:py-7"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-accent/15 to-accent/5 shadow-warm-sm ring-1 ring-accent/10">
                  <badge.icon className="size-5 text-accent" strokeWidth={1.75} aria-hidden />
                </span>
                <p className="text-sm font-bold text-foreground">{badge.title}</p>
                <p className="text-2xs leading-snug text-muted-foreground">
                  {badge.desc}
                </p>
              </motion.li>
            ))}
          </motion.ul>
        </div>
      </Container>
    </motion.div>
  );
}
