"use client";

import { motion } from "framer-motion";

import { Container, Section } from "@/components/layout/container";
import { BundleCard } from "@/components/product/bundle-card";
import { staggerContainer, staggerItem, VIEWPORT } from "@/lib/animations";

const bundles = [
  {
    id: "starter",
    title: "مجموعة البداية",
    description: "أفضل اختيار لتجربة منتجاتنا للمرة الأولى",
    price: 189,
    comparePrice: 250,
    variant: "default" as const,
    items: [
      { name: "أملو الكلاسيكي",  emoji: "🫙" },
      { name: "زيت أركان",       emoji: "✨" },
      { name: "عسل طبيعي",      emoji: "🍯" },
    ],
  },
  {
    id: "family",
    title: "العبوة العائلية",
    description: "كميات مضاعفة بسعر منخفض — مثالية للمنزل",
    price: 399,
    comparePrice: 520,
    variant: "gold" as const,
    isPopular: true,
    items: [
      { name: "أملو الكلاسيكي",  emoji: "🫙" },
      { name: "أملو بالفستق",    emoji: "🥜" },
      { name: "زيت أركان",       emoji: "✨" },
      { name: "عسل طبيعي",      emoji: "🍯" },
      { name: "مكسرات بالعسل",  emoji: "🌰" },
    ],
  },
  {
    id: "gift",
    title: "علبة هدية فاخرة",
    description: "تغليف أنيق جاهز للإهداء في كل المناسبات",
    price: 249,
    comparePrice: 320,
    variant: "olive" as const,
    items: [
      { name: "أملو بالفستق",    emoji: "🥜" },
      { name: "زيت أركان",       emoji: "✨" },
      { name: "عسل طبيعي",      emoji: "🍯" },
    ],
  },
];

export function BundleSection() {
  return (
    <Section id="bundles" spacing="lg" bg="alt">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={VIEWPORT}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center"
        >
          <p className="text-sm font-semibold uppercase tracking-widest text-accent">
            عروض خاصة
          </p>
          <h2 className="mt-2 text-3xl font-bold text-foreground md:text-4xl">
            عروض العائلة والهدايا
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            وفّر أكثر مع مجموعاتنا المختارة — مثالية للمنزل والمناسبات
            والهدايا في رمضان والأعياد.
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT}
          className="grid gap-5 md:grid-cols-2 lg:grid-cols-3"
        >
          {bundles.map((bundle) => (
            <motion.div key={bundle.id} variants={staggerItem}>
              <BundleCard
                title={bundle.title}
                description={bundle.description}
                price={bundle.price}
                comparePrice={bundle.comparePrice}
                items={bundle.items}
                isPopular={bundle.isPopular}
                variant={bundle.variant}
                className="h-full"
              />
            </motion.div>
          ))}
        </motion.div>
      </Container>
    </Section>
  );
}
