"use client";

import { ProductFeatureSection } from "@/components/home/product-feature-section";
import { productShowcases } from "@/lib/home-data";

export function ProductShowcasesSection() {
  return (
    <>
      {productShowcases.map((product) => (
        <ProductFeatureSection key={product.id} {...product} />
      ))}
    </>
  );
}
