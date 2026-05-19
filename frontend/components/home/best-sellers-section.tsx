"use client";

import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

import { Container, Section } from "@/components/layout/container";
import { ProductCard } from "@/components/product/product-card";
import { SectionHeader } from "@/components/sections/section-header";
import { Button } from "@/components/ui/button";
import { bestSellers } from "@/lib/home-data";
import { staggerContainer, staggerItem, VIEWPORT } from "@/lib/animations";

export function BestSellersSection() {
  return (
    <Section id="products" spacing="lg" bg="alt">
      <Container>
        <div className="flex flex-col items-end justify-between gap-6 md:flex-row md:items-end">
          <SectionHeader
            label="الأكثر مبيعاً"
            title="منتجات يعشقها المغاربة"
            description="جودة فاخرة، تقييمات حقيقية، والدفع عند الاستلام — بدون تعقيد."
            align="start"
            className="mb-0 md:max-w-xl"
          />
          <Button variant="outline" className="shrink-0 gap-2">
            عرض الكل
            <ArrowLeft className="size-4" />
          </Button>
        </div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT}
          className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
        >
          {bestSellers.map((product) => (
            <motion.div key={product.id} variants={staggerItem}>
              <ProductCard
                name={product.name}
                price={product.price}
                comparePrice={product.comparePrice}
                weight={product.weight}
                gradient={product.gradient}
                emoji={product.emoji}
                rating={product.rating}
                reviewCount={product.reviewCount}
                soldLabel={product.soldLabel}
                isNew={product.isNew}
              />
            </motion.div>
          ))}
        </motion.div>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          جميع الأسعار بالدرهم المغربي · الدفع عند الاستلام في كل الطلبات
        </p>
      </Container>
    </Section>
  );
}
