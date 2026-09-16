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
import { useTranslation } from "@/lib/i18n/language-provider";
import { staggerContainer, staggerItem, VIEWPORT } from "@/lib/animations";
import { getListingProducts, sortListingForHome } from "@/lib/products/listing";

/**
 * Home catalog grid — same data path as /products
 * (`useCatalogProducts` → `/api/catalog` → `getListingProducts` → `CatalogProductCard`).
 */
export function HomeProductsSection() {
  const { t } = useTranslation();
  const allProducts = useCatalogProducts();
  const products = useMemo(
    () => sortListingForHome(getListingProducts(allProducts)),
    [allProducts],
  );

  return (
    <Section
      id="discover-products"
      spacing="lg"
      className="texture-grain scroll-mt-[var(--header-height)] pt-[calc(var(--header-height)+1.25rem)] md:pt-[calc(var(--header-height)+2rem)]"
    >
      <Container>
        <SectionHeader
          label="TazarzitBio"
          title={t("discover.title")}
          description={t("discover.desc")}
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
            {t("discover.empty")}
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
              {t("discover.viewAll")}
              <ArrowLeft className="size-4" aria-hidden />
            </Link>
          </Button>
        </div>
      </Container>
    </Section>
  );
}
