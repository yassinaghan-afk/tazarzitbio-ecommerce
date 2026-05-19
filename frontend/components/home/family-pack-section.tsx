"use client";

import { motion } from "framer-motion";
import { Coffee, Gift, Heart } from "lucide-react";

import { Container, Section } from "@/components/layout/container";
import { BundleCard } from "@/components/product/bundle-card";
import { SectionHeader } from "@/components/sections/section-header";
import { PremiumImage } from "@/components/ui/premium-image";
import { familyPacks } from "@/lib/home-data";
import { fadeUp, staggerContainer, staggerItem, VIEWPORT } from "@/lib/animations";

const hospitalityPoints = [
  { icon: Gift,   title: "هدايا فاخرة",     desc: "تغليف يليق بالعيد والأفراح" },
  { icon: Coffee, title: "فطور العائلة",   desc: "مائدة مغربية كاملة في عبوة واحدة" },
  { icon: Heart,  title: "كرم الضيافة",    desc: "تعبّر عن حبك لمن تحب" },
];

export function FamilyPackSection() {
  return (
    <Section id="bundles" spacing="lg">
      <Container>
        <SectionHeader
          label="عروض العائلة"
          title="ضيافة مغربية في كل عبوة"
          description="علب هدايا وباقات عائلية مصممة للفطور، المناسبات، ولمسة الكرم المغربي الأصيل."
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
            <PremiumImage
              src="/products/pack.png"
              alt="مجموعة تازارزيت بيو الفاخرة للعائلة والإهداء"
              aspect="portrait"
              sizes="(max-width: 1024px) 100vw, 360px"
              className="shadow-warm-xl"
            />
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
                  comparePrice={pack.comparePrice}
                  items={pack.items}
                  isPopular={pack.isPopular}
                  variant={pack.variant}
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </Container>
    </Section>
  );
}
