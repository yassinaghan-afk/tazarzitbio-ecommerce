"use client";

import { ProductFeatureSection } from "@/components/home/product-feature-section";
import { useTranslation } from "@/lib/i18n/language-provider";
import { getShowcaseContent } from "@/lib/i18n/home-content";

const SHOWCASE_META = [
  {
    id: "daghmous-honey" as const,
    price: 169,
    imageSrc: "/images/products/Daghmous_honey.jpeg",
    imageAlt: "Daghmous honey Tazarzit Bio",
    imageFirst: false,
  },
  {
    id: "saatar-honey" as const,
    price: 149,
    imageSrc: "/images/products/saatar_honey.jpeg",
    imageAlt: "Thyme honey Tazarzit Bio",
    imageFirst: true,
  },
  {
    id: "eucalyptus-honey" as const,
    price: 99,
    imageSrc: "/images/products/eucalyptus_honey.jpeg",
    imageAlt: "Eucalyptus honey Tazarzit Bio",
    imageFirst: false,
  },
  {
    id: "cocoa-amlou" as const,
    price: 79,
    imageSrc: "/images/products/Cocoa_amlou.jpeg",
    imageAlt: "Cocoa amlou Tazarzit Bio",
    imageFirst: true,
  },
];

export function ProductShowcasesSection() {
  const { t } = useTranslation();

  return (
    <>
      {SHOWCASE_META.map((meta) => (
        <ProductFeatureSection
          key={meta.id}
          {...getShowcaseContent(
            meta.id,
            t,
            meta.price,
            meta.imageSrc,
            meta.imageAlt,
            meta.imageFirst,
          )}
        />
      ))}
    </>
  );
}
