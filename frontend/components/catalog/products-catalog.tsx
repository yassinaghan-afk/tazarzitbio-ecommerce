"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";

import { CatalogProductCard } from "@/components/catalog/catalog-product-card";
import { CategoryFilters } from "@/components/catalog/category-filters";
import { Container, Section } from "@/components/layout/container";
import { staggerContainer, staggerItem, VIEWPORT } from "@/lib/animations";
import { useCatalogProducts } from "@/hooks/use-catalog";
import { getListingProducts } from "@/lib/products/listing";
import type { ProductCategory } from "@/lib/products";

export function ProductsCatalog() {
  const [category, setCategory] = useState<ProductCategory>("all");
  const allProducts = useCatalogProducts();

  const listingProducts = useMemo(
    () => getListingProducts(allProducts),
    [allProducts],
  );

  const filtered = useMemo(() => {
    if (category === "all") return listingProducts;
    return listingProducts.filter((p) => p.category === category);
  }, [category, listingProducts]);

  return (
    <Section spacing="md" className="texture-grain !pt-6 md:!pt-8">
      <Container>
        <CategoryFilters active={category} onChange={setCategory} />

        <p className="mt-4 text-center text-sm text-muted-foreground">
          {filtered.length} منتج
          {category !== "all" ? " في هذه الفئة" : ""}
        </p>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT}
          className="mt-6 grid gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:mt-8"
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
