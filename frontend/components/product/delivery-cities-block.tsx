"use client";

import { useTranslation } from "@/lib/i18n/language-provider";

const CITY_KEYS = [
  "cities.casablanca",
  "cities.rabat",
  "cities.marrakech",
  "cities.agadir",
  "cities.tanger",
  "cities.fes",
  "cities.meknes",
  "cities.oujda",
  "cities.kenitra",
  "cities.tetouan",
] as const;

export function DeliveryCitiesBlock({ className }: { className?: string }) {
  const { t } = useTranslation();

  return (
    <div className={className}>
      <h2 className="text-lg font-bold text-foreground sm:text-xl">
        {t("cities.title")}
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">{t("cities.desc")}</p>
      <ul className="mt-4 flex flex-wrap gap-2">
        {CITY_KEYS.map((key) => (
          <li
            key={key}
            className="rounded-full border border-border bg-secondary/50 px-3 py-1.5 text-xs font-medium text-foreground/80"
          >
            {t(key)}
          </li>
        ))}
        <li className="rounded-full border border-accent/30 bg-accent/10 px-3 py-1.5 text-xs font-semibold text-accent-foreground">
          {t("cities.more")}
        </li>
      </ul>
    </div>
  );
}
