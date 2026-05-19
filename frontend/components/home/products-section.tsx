"use client";

import { useState } from "react";
import { motion } from "framer-motion";

import { Container, Section } from "@/components/layout/container";
import { ProductCard } from "@/components/product/product-card";
import { Button } from "@/components/ui/button";
import { staggerContainer, staggerItem, VIEWPORT } from "@/lib/animations";

const categories = ["الكل", "أملو", "زيت أركان", "عسل ومكسرات", "هدايا"];

const products = [
  { id: "1", name: "أملو تازارزيت الكلاسيكي",  price: 89,  comparePrice: 110, weight: "250 غ",  category: "أملو",        gradient: "from-amber-50 via-orange-50 to-amber-100",    emoji: "🫙" },
  { id: "2", name: "أملو بالفستق",               price: 129, comparePrice: 160, weight: "250 غ",  category: "أملو",        gradient: "from-green-50 via-emerald-50 to-lime-100",    emoji: "🥜", isNew: true },
  { id: "3", name: "أملو باللوز",                price: 109, weight: "250 غ",                      category: "أملو",        gradient: "from-amber-50 to-yellow-100",                  emoji: "🌰" },
  { id: "4", name: "زيت أركان طبيعي",            price: 149, weight: "100 مل", category: "زيت أركان", gradient: "from-yellow-50 via-amber-50 to-orange-50",    emoji: "✨" },
  { id: "5", name: "عسل طبيعي من سوس",           price: 75,  comparePrice: 95,  weight: "500 غ",  category: "عسل ومكسرات", gradient: "from-yellow-100 via-amber-100 to-orange-50",  emoji: "🍯" },
  { id: "6", name: "مكسرات بالعسل",              price: 95,  weight: "300 غ",                      category: "عسل ومكسرات", gradient: "from-stone-50 via-amber-50 to-yellow-50",     emoji: "🌰" },
  { id: "7", name: "علبة هدايا كلاسيكية",        price: 249, weight: "3 منتجات", category: "هدايا", gradient: "from-emerald-50 via-teal-50 to-green-50",      emoji: "🎁", isNew: true },
  { id: "8", name: "العبوة العائلية الكاملة",    price: 399, comparePrice: 480, weight: "5 منتجات", category: "هدايا", gradient: "from-rose-50 via-pink-50 to-amber-50",        emoji: "👨‍👩‍👧‍👦" },
];

export function ProductsSection() {
  const [activeCategory, setActiveCategory] = useState("الكل");

  const filtered =
    activeCategory === "الكل"
      ? products
      : products.filter((p) => p.category === activeCategory);

  return (
    <Section id="products" spacing="lg">
      <Container>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={VIEWPORT}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end"
        >
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-accent">
              مجموعتنا
            </p>
            <h2 className="mt-1 text-3xl font-bold text-foreground md:text-4xl">
              منتجات طبيعية مختارة
            </h2>
          </div>
          <Button variant="outline" size="sm">
            عرض الكل
          </Button>
        </motion.div>

        {/* Category tabs */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={VIEWPORT}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="mt-8 flex flex-wrap gap-2"
        >
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-all duration-200 ${
                activeCategory === cat
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-border bg-card text-muted-foreground hover:border-foreground/20 hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </motion.div>

        {/* Grid */}
        <motion.div
          key={activeCategory}
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          {filtered.map((product) => (
            <motion.div key={product.id} variants={staggerItem}>
              <ProductCard
                name={product.name}
                price={product.price}
                comparePrice={product.comparePrice}
                weight={product.weight}
                gradient={product.gradient}
                emoji={product.emoji}
                isNew={product.isNew}
              />
            </motion.div>
          ))}
        </motion.div>
      </Container>
    </Section>
  );
}
