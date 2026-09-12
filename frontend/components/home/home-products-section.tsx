"use client";

import { useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

import { CatalogProductCard } from "@/components/catalog/catalog-product-card";
import { Container, Section } from "@/components/layout/container";
import { SectionHeader } from "@/components/sections/section-header";
import { Button } from "@/components/ui/button";
import { useCatalogProducts } from "@/hooks/use-catalog";
import { staggerContainer, staggerItem, VIEWPORT } from "@/lib/animations";
import { getListingProducts } from "@/lib/products/listing";

/**
 * Home catalog grid — same data path as /products
 * (`useCatalogProducts` → `/api/catalog` → `getListingProducts` → `CatalogProductCard`).
 */
export function HomeProductsSection() {
  const allProducts = useCatalogProducts();
  const products = useMemo(
    () => getListingProducts(allProducts),
    [allProducts],
  );

  return (
    <Section id="discover-products" spacing="lg" className="texture-grain">
      <Container>
        <SectionHeader
          label="TazarzitBio"
          title="اكتشف منتجاتنا"
          description="منتجات طبيعية مختارة بعناية من TazarzitBio"
          align="center"
        />

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT}
          className="mt-2 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4 lg:gap-6"
        >
          {products.map((product) => (
            <motion.div key={product.id} variants={staggerItem}>
              <CatalogProductCard product={product} />
            </motion.div>
          ))}
        </motion.div>

        {products.length === 0 && (
          <p className="mt-8 text-center text-sm text-muted-foreground">
            لا توجد منتجات متاحة حالياً.
          </p>
        )}

        <div className="mt-10 flex justify-center md:mt-12">
          <Button
            variant="gold"
            size="lg"
            className="min-h-12 gap-2 rounded-full px-8 text-base font-extrabold shadow-gold"
            asChild
          >
            <Link href="/products">
              عرض جميع المنتجات
              <ArrowLeft className="size-4" aria-hidden />
            </Link>
          </Button>
        </div>
      </Container>
    </Section>
  );
}
