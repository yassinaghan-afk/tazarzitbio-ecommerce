"use client";

import Link from "next/link";

import { useTranslation } from "@/lib/i18n/language-provider";
import { cn } from "@/lib/utils";

const CITIES: {
  key:
    | "cities.casablanca"
    | "cities.rabat"
    | "cities.marrakech"
    | "cities.agadir"
    | "cities.tanger"
    | "cities.fes"
    | "cities.meknes"
    | "cities.oujda"
    | "cities.kenitra"
    | "cities.tetouan";
  href?: string;
}[] = [
  { key: "cities.casablanca", href: "/guide/amlou-casablanca" },
  { key: "cities.rabat" },
  { key: "cities.marrakech", href: "/guide/amlou-marrakech" },
  { key: "cities.agadir", href: "/guide/amlou-agadir" },
  { key: "cities.tanger" },
  { key: "cities.fes" },
  { key: "cities.meknes" },
  { key: "cities.oujda" },
  { key: "cities.kenitra" },
  { key: "cities.tetouan" },
];

export function DeliveryCitiesBlock({ className }: { className?: string }) {
  const { t } = useTranslation();

  return (
    <div className={className}>
      <h2 className="text-lg font-bold text-foreground sm:text-xl">
        {t("cities.title")}
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">{t("cities.desc")}</p>
      <ul className="mt-4 flex flex-wrap gap-2">
        {CITIES.map(({ key, href }) => {
          const label = t(key);
          const chipClass = cn(
            "rounded-full border border-border bg-secondary/50 px-3 py-1.5 text-xs font-medium text-foreground/80",
            href && "transition-colors hover:border-accent hover:text-accent",
          );
          return (
            <li key={key}>
              {href ? (
                <Link href={href} className={chipClass}>
                  {label}
                </Link>
              ) : (
                <span className={chipClass}>{label}</span>
              )}
            </li>
          );
        })}
        <li className="rounded-full border border-accent/30 bg-accent/10 px-3 py-1.5 text-xs font-semibold text-accent-foreground">
          {t("cities.more")}
        </li>
      </ul>
    </div>
  );
}
