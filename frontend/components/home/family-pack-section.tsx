"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Coffee, Package, Heart } from "lucide-react";

import { Container, Section } from "@/components/layout/container";
import { BundleCard } from "@/components/product/bundle-card";
import { SectionHeader } from "@/components/sections/section-header";
import { PremiumImage } from "@/components/ui/premium-image";
import { familyPacks } from "@/lib/home-data";
import { fadeUp, staggerContainer, staggerItem, VIEWPORT } from "@/lib/animations";

const hospitalityPoints = [
  { icon: Package, title: "قيمة عائلية",   desc: "تشكيلة عملية بسعر أوفر" },
  { icon: Coffee,  title: "فطور العائلة", desc: "مائدة مغربية في باقة واحدة" },
  { icon: Heart,   title: "جودة سوس",     desc: "منتجات طبيعية من مصدر موثوق" },
];

export function FamilyPackSection() {
  return (
    <Section id="bundles" spacing="lg">
      <Container>
        <SectionHeader
          label="عروض العائلة"
          title="ضيافة مغربية في كل عبوة"
          description="باقات عائلية بأسعار مناسبة — للفطور اليومي والمخزون المنزلي دون تغليف هدايا فاخر."
        />

        <div className="mb-14 grid gap-6 md:grid-cols-3">
          {hospitalityPoints.map((point, i) => (
            <motion.div
              key={point.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={VIEWPORT}
              transition={{ delay: i * 0.08, duration: 0.45 }}
              className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-warm-sm"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent/10">
                <point.icon className="size-6 text-accent" />
              </div>
              <div>
                <p className="font-bold text-foreground">{point.title}</p>
                <p className="text-sm text-muted-foreground">{point.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid items-start gap-10 lg:grid-cols-5 lg:gap-12">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT}
            className="lg:col-span-2"
          >
            <Link
              href="/products/premium-family-pack"
              className="block transition-opacity hover:opacity-95"
            >
              <PremiumImage
                src="/images/products/pack.png"
                alt="باقة عائلية تازارزيت بيو"
                aspect="portrait"
                sizes="(max-width: 1024px) 100vw, 360px"
                className="shadow-warm-xl"
              />
            </Link>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT}
            className="flex flex-col gap-5 lg:col-span-3"
          >
            {familyPacks.map((pack) => (
              <motion.div key={pack.id} variants={staggerItem}>
                <BundleCard
                  title={pack.title}
                  description={pack.description}
                  price={pack.price}
                  items={pack.items}
                  isPopular={pack.isPopular}
                  variant={pack.variant}
                  productSlug={pack.slug}
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </Container>
    </Section>
  );
}
