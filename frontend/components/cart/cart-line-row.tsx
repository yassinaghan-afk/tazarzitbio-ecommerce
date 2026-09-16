"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";

import { useCommerce } from "@/components/providers/commerce-provider";
import { Button } from "@/components/ui/button";
import type { CartLineItem } from "@/lib/cart/types";
import { useTranslation } from "@/lib/i18n/language-provider";
import {
  localizeLineName,
  localizeWeightLabel,
} from "@/lib/i18n/product-locale";

interface CartLineRowProps {
  item: CartLineItem;
  compact?: boolean;
  showRemove?: boolean;
  linkToProduct?: boolean;
}

export function CartLineRow({
  item,
  compact = false,
  showRemove = true,
  linkToProduct = false,
}: CartLineRowProps) {
  const { t, locale } = useTranslation();
  const { updateQuantity, removeItem } = useCommerce();
  const imageSize = compact ? "h-12 w-12" : "h-16 w-16";
  const displayName = localizeLineName(item.slug, item.nameAr, locale);
  const displayOffer = localizeWeightLabel(item.offerLabel, locale);

  const imageBlock = (
    <div
      className={`relative ${imageSize} shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-[#3d2818] to-[#2a1810]`}
    >
      <Image
        src={item.image}
        alt={displayName}
        fill
        sizes={compact ? "48px" : "64px"}
        className="object-contain p-1"
      />
    </div>
  );

  return (
    <li className="flex gap-3">
      {linkToProduct ? (
        <Link href={`/products/${item.slug}`} className="shrink-0">
          {imageBlock}
        </Link>
      ) : (
        imageBlock
      )}

      <div className="min-w-0 flex-1">
        {linkToProduct ? (
          <Link
            href={`/products/${item.slug}`}
            className="line-clamp-2 text-sm font-bold text-foreground hover:text-accent"
          >
            {displayName}
          </Link>
        ) : (
          <p className="line-clamp-2 text-sm font-semibold text-foreground">
            {displayName}
          </p>
        )}
        {!displayName.includes(displayOffer) && (
          <p className="text-xs text-muted-foreground">{displayOffer}</p>
        )}

        <div className="mt-2 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-0.5">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={t("cart.decrease")}
              onClick={() => updateQuantity(item.lineId, item.quantity - 1)}
            >
              <Minus className="size-3.5" />
            </Button>
            <span className="min-w-[1.5rem] text-center text-sm font-bold tabular-nums">
              {item.quantity}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={t("cart.increase")}
              onClick={() => updateQuantity(item.lineId, item.quantity + 1)}
            >
              <Plus className="size-3.5" />
            </Button>
          </div>
          <span className="text-sm font-extrabold tabular-nums text-accent">
            {item.unitPrice * item.quantity} {t("common.currency")}
          </span>
        </div>
      </div>

      {showRemove && (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={t("cart.remove")}
          className="shrink-0 self-start text-muted-foreground hover:text-destructive"
          onClick={() => removeItem(item.lineId)}
        >
          <Trash2 className="size-4" />
        </Button>
      )}
    </li>
  );
}
