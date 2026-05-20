"use client";

import { useCallback, useEffect, useState } from "react";

import { loadPricingOverrides } from "@/lib/products/admin-storage";
import { getPublicProducts, toPublicProduct } from "@/lib/products/catalog";
import { baseCatalog } from "@/lib/products/catalog-base";
import type { Product, PublicProduct } from "@/lib/products/types";

/** Stable on server and first client paint — avoids hydration mismatch */
const INITIAL_PUBLIC_PRODUCTS = baseCatalog.map(toPublicProduct);

async function fetchPublicCatalog(): Promise<PublicProduct[]> {
  try {
    const res = await fetch("/api/catalog", { cache: "no-store" });
    if (!res.ok) return getPublicProducts();
    const data = (await res.json()) as { products: PublicProduct[] };
    return Array.isArray(data.products) && data.products.length
      ? data.products
      : getPublicProducts();
  } catch {
    return getPublicProducts();
  }
}

export function useCatalogProducts(): PublicProduct[] {
  const [products, setProducts] = useState<PublicProduct[]>(
    INITIAL_PUBLIC_PRODUCTS,
  );

  const refresh = useCallback(() => {
    void fetchPublicCatalog().then(setProducts);
  }, []);

  useEffect(() => {
    refresh();
    const onUpdate = () => refresh();
    window.addEventListener("tazarzit-pricing-updated", onUpdate);
    window.addEventListener("tazarzit-catalog-updated", onUpdate);
    window.addEventListener("storage", onUpdate);
    return () => {
      window.removeEventListener("tazarzit-pricing-updated", onUpdate);
      window.removeEventListener("tazarzit-catalog-updated", onUpdate);
      window.removeEventListener("storage", onUpdate);
    };
  }, [refresh]);

  return products;
}

export function useCatalogProduct(slug: string): {
  product: Product | undefined;
  publicProduct: PublicProduct | undefined;
} {
  const [publicProduct, setPublicProduct] = useState<PublicProduct | undefined>(
    () => INITIAL_PUBLIC_PRODUCTS.find((p) => p.slug === slug),
  );

  const refresh = useCallback(() => {
    void fetchPublicCatalog().then((products) => {
      setPublicProduct(products.find((p) => p.slug === slug));
    });
  }, [slug]);

  useEffect(() => {
    refresh();
    const onUpdate = () => refresh();
    window.addEventListener("tazarzit-pricing-updated", onUpdate);
    window.addEventListener("tazarzit-catalog-updated", onUpdate);
    return () => {
      window.removeEventListener("tazarzit-pricing-updated", onUpdate);
      window.removeEventListener("tazarzit-catalog-updated", onUpdate);
    };
  }, [refresh]);

  return {
    product: undefined,
    publicProduct,
  };
}
