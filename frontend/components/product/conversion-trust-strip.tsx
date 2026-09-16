"use client";

import { BadgeCheck, Leaf, MapPin, Truck } from "lucide-react";

import { useTranslation } from "@/lib/i18n/language-provider";

const ITEMS = [
  { icon: Leaf, key: "convert.trustNatural" as const },
  { icon: Truck, key: "convert.trustCod" as const },
  { icon: MapPin, key: "convert.trustShip" as const },
  { icon: BadgeCheck, key: "convert.trustQuality" as const },
] as const;

/** Compact trust strip under PDP price — mirrors local competitor conversion patterns. */
export function ConversionTrustStrip() {
  const { t } = useTranslation();

  return (
    <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {ITEMS.map(({ icon: Icon, key }) => (
        <li
          key={key}
          className="flex items-center gap-2 rounded-xl border border-border/80 bg-card/80 px-3 py-2.5 text-xs font-semibold text-foreground/90"
        >
          <Icon className="size-4 shrink-0 text-accent" aria-hidden />
          <span>{t(key)}</span>
        </li>
      ))}
    </ul>
  );
}
