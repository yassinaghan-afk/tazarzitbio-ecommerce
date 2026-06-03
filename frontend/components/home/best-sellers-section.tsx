"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

import { CatalogProductCard } from "@/components/catalog/catalog-product-card";
import { CategoryFilters } from "@/components/catalog/category-filters";
import { Container, Section } from "@/components/layout/container";
import { SectionHeader } from "@/components/sections/section-header";
import { Button } from "@/components/ui/button";
import { useCatalogProducts } from "@/hooks/use-catalog";
import { useTranslation } from "@/lib/i18n/language-provider";
import { staggerContainer, staggerItem, VIEWPORT } from "@/lib/animations";
import { getListingProducts } from "@/lib/products/listing";
import type { ProductCategory } from "@/lib/products";

const HOME_CATEGORIES: ProductCategory[] = ["all", "honey", "amlou"];

export function BestSellersSection() {
  const { t } = useTranslation();
  const allProducts = useCatalogProducts();
  const [category, setCategory] = useState<ProductCategory>("all");

  const listingProducts = useMemo(
    () =>
      getListingProducts(allProducts, {
        excludeSlugs: ["premium-family-pack"],
      }),
    [allProducts],
  );

  const products = useMemo(() => {
    if (category === "all") return listingProducts;
    return listingProducts.filter((p) => p.category === category);
  }, [listingProducts, category]);

  return (
    <Section id="products" spacing="lg" bg="alt" className="texture-grain">
      <Container>
        <div className="flex flex-col items-end justify-between gap-6 md:flex-row md:items-end">
          <SectionHeader
            label={t("bestSellers.label")}
            title={t("bestSellers.title")}
            description={t("bestSellers.desc")}
            align="start"
            className="mb-0 md:max-w-xl"
          />
          <Button variant="outline" className="shrink-0 gap-2" asChild>
            <Link href="/products">
              {t("bestSellers.viewAll")}
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
        </div>

        <div className="mt-8">
          <CategoryFilters
            active={category}
            onChange={setCategory}
            filters={HOME_CATEGORIES.map((id) => ({
              id,
              label:
                id === "all"
                  ? t("bestSellers.catAll")
                  : id === "honey"
                    ? t("bestSellers.catHoney")
                    : t("bestSellers.catAmlou"),
            }))}
          />
        </div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT}
          className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {products.slice(0, 8).map((product) => (
            <motion.div key={product.id} variants={staggerItem}>
              <CatalogProductCard product={product} />
            </motion.div>
          ))}
        </motion.div>

        {products.length === 0 && (
          <p className="mt-8 text-center text-sm text-muted-foreground">
            {t("bestSellers.empty")}
          </p>
        )}

        <p className="mt-8 text-center text-sm text-muted-foreground">
          {t("bestSellers.footer")}
        </p>
      </Container>
    </Section>
  );
}
