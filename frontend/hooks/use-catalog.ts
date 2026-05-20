"use client";

import { useCallback, useEffect, useState } from "react";

import { loadPricingOverrides } from "@/lib/products/admin-storage";
import { getCatalog, getPublicProducts, toPublicProduct } from "@/lib/products/catalog";
import type { Product, PublicProduct } from "@/lib/products/types";

export function useCatalogProducts(): PublicProduct[] {
  const [products, setProducts] = useState<PublicProduct[]>(() =>
    typeof window !== "undefined"
      ? getPublicProducts()
      : [],
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
