"use client";

import { useCallback, useEffect, useState } from "react";

import { loadPricingOverrides } from "@/lib/products/admin-storage";
import {
  getCatalog,
  getPublicProducts,
  toPublicProduct,
} from "@/lib/products/catalog";
import { baseCatalog } from "@/lib/products/catalog-base";
import type { Product, PublicProduct } from "@/lib/products/types";

/** Stable on server and first client paint — avoids hydration mismatch */
const INITIAL_PUBLIC_PRODUCTS = baseCatalog.map(toPublicProduct);

export function useCatalogProducts(): PublicProduct[] {
  const [products, setProducts] = useState<PublicProduct[]>(
    INITIAL_PUBLIC_PRODUCTS,
  );

  const refresh = useCallback(() => {
    setProducts(getPublicProducts());
  }, []);

  useEffect(() => {
    refresh();
    const onUpdate = () => refresh();
    window.addEventListener("tazarzit-pricing-updated", onUpdate);
    window.addEventListener("storage", onUpdate);
    return () => {
      window.removeEventListener("tazarzit-pricing-updated", onUpdate);
      window.removeEventListener("storage", onUpdate);
    };
  }, [refresh]);

  return products;
}

export function useCatalogProduct(slug: string): {
  product: Product | undefined;
  publicProduct: PublicProduct | undefined;
} {
  const [product, setProduct] = useState<Product | undefined>();

  const refresh = useCallback(() => {
    const catalog = getCatalog(loadPricingOverrides());
    setProduct(catalog.find((p) => p.slug === slug));
  }, [slug]);

  useEffect(() => {
    refresh();
    const onUpdate = () => refresh();
    window.addEventListener("tazarzit-pricing-updated", onUpdate);
    return () => window.removeEventListener("tazarzit-pricing-updated", onUpdate);
  }, [refresh]);

  return {
    product,
    publicProduct: product ? toPublicProduct(product) : undefined,
  };
}
