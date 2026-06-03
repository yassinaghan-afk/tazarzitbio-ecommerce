"use client";

import { motion } from "framer-motion";

import type { ProductCategory } from "@/lib/products";
import { getDefaultCategoryFilters } from "@/lib/i18n/category-labels";
import { useTranslation } from "@/lib/i18n/language-provider";
import { cn } from "@/lib/utils";

interface CategoryFiltersProps {
  active: ProductCategory;
  onChange: (category: ProductCategory) => void;
  filters?: { id: ProductCategory; label: string }[];
}

export function CategoryFilters({
  active,
  onChange,
  filters,
}: CategoryFiltersProps) {
  const { t, locale } = useTranslation();
  const resolvedFilters = filters ?? getDefaultCategoryFilters(locale);

  return (
    <div
      className="scrollbar-hide flex w-full max-w-full gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible"
      role="tablist"
      aria-label={t("category.filterAria")}
    >
      {resolvedFilters.map((filter) => (
        <button
          key={filter.id}
          type="button"
          role="tab"
          aria-selected={active === filter.id}
          onClick={() => onChange(filter.id)}
          className={cn(
            "relative shrink-0 rounded-full px-4 py-2.5 text-sm font-semibold transition-colors",
            active === filter.id
              ? "text-foreground"
              : "text-muted-foreground hover:bg-secondary/80 hover:text-foreground",
          )}
        >
          {active === filter.id && (
            <motion.span
              layoutId="category-pill"
              className="absolute inset-0 rounded-full bg-gold-gradient shadow-gold ring-1 ring-amber-900/10"
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          )}
          <span className="relative z-[1]">{filter.label}</span>
        </button>
      ))}
    </div>
  );
}
