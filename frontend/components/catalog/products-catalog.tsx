"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";

import { CatalogProductCard } from "@/components/catalog/catalog-product-card";
import { CategoryFilters } from "@/components/catalog/category-filters";
import { Container, Section } from "@/components/layout/container";
import { SectionHeader } from "@/components/sections/section-header";
import { staggerContainer, staggerItem, VIEWPORT } from "@/lib/animations";
import { useCatalogProducts } from "@/hooks/use-catalog";
import type { ProductCategory } from "@/lib/products";

export function ProductsCatalog() {
  const [category, setCategory] = useState<ProductCategory>("all");
  const allProducts = useCatalogProducts();

  const filtered = useMemo(() => {
    if (category === "all") return allProducts;
    return allProducts.filter((p) => p.category === category);
  }, [category, allProducts]);

  return (
    <Section spacing="lg" className="texture-grain">
      <Container>
        <SectionHeader
          label="متجر تازارزيت بيو"
          title="منتجات طبيعية فاخرة"
          description="أملو، زيوت، ومكسرات من سوس — جودة حرفية، تغليف أنيق، والدفع عند الاستلام."
          align="center"
          className="mb-10"
        />

        <CategoryFilters active={category} onChange={setCategory} />

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {filtered.length} من {allProducts.length} منتج
          {category !== "all" ? " في هذه الفئة" : ""}
        </p>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT}
          className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {filtered.map((product) => (
            <motion.div key={product.id} variants={staggerItem}>
              <CatalogProductCard product={product} />
            </motion.div>
          ))}
        </motion.div>
      </Container>
    </Section>
  );
}
