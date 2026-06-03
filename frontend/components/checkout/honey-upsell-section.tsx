"use client";

import {
  HoneyUpsellCard,
  type HoneyUpsellCtaMode,
} from "@/components/checkout/honey-upsell-card";
import { useTranslation } from "@/lib/i18n/language-provider";
import type { PublicProduct } from "@/lib/products/types";
import { cn } from "@/lib/utils";

interface HoneyUpsellSectionProps {
  products: PublicProduct[];
  title?: string;
  subtitle?: string;
  /** inline = stacked list (cart/checkout); grid = thank-you layout */
  layout?: "inline" | "grid";
  compact?: boolean;
  className?: string;
  ctaMode?: HoneyUpsellCtaMode;
  /** Hide inner header (e.g. thank-you page provides its own title) */
  hideHeader?: boolean;
}

export function HoneyUpsellSection({
  products,
  title,
  subtitle,
  layout = "inline",
  compact = false,
  className,
  ctaMode = "addToOrder",
  hideHeader = false,
}: HoneyUpsellSectionProps) {
  const { t } = useTranslation();
  const resolvedTitle = title ?? t("honey.defaultTitle");
  const resolvedSubtitle = subtitle ?? t("honey.defaultSub");

  if (products.length === 0) return null;

  return (
    <section
      className={cn(
        "rounded-2xl border border-foreground/10 bg-gradient-to-b from-background/80 to-card/60 p-4 shadow-warm-sm ring-1 ring-accent/10",
        className,
      )}
      aria-label={resolvedTitle}
    >
      {!hideHeader && (
        <header className="mb-3 border-b border-border/40 pb-3">
          <p className="text-2xs font-bold uppercase tracking-[0.15em] text-accent">
            {t("honey.upsellLabel")}
          </p>
          <h2 className="text-display mt-1 text-base font-extrabold text-foreground sm:text-lg">
            {resolvedTitle}
          </h2>
          {resolvedSubtitle && (
            <p className="mt-1 text-2xs leading-relaxed text-muted-foreground sm:text-xs">
              {resolvedSubtitle}
            </p>
          )}
        </header>
      )}

      <ul
        className={cn(
          layout === "grid"
            ? "grid grid-cols-1 gap-4 sm:grid-cols-2"
            : "space-y-3",
        )}
      >
        {products.map((product) => (
          <li key={product.id}>
            <HoneyUpsellCard
              product={product}
              compact={compact || layout === "inline"}
              ctaMode={ctaMode}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
