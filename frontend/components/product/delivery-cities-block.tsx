"use client";

import Link from "next/link";

import { useTranslation } from "@/lib/i18n/language-provider";
import {
  AMLOU_CITIES,
  amlouCityPath,
} from "@/lib/seo/amlou-cities";
import { localizedPath } from "@/lib/seo/locale";
import { cn } from "@/lib/utils";

export function DeliveryCitiesBlock({ className }: { className?: string }) {
  const { t, locale } = useTranslation();

  return (
    <div className={className}>
      <h2 className="text-lg font-bold text-foreground sm:text-xl">
        {t("cities.title")}
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">{t("cities.desc")}</p>
      <ul className="mt-4 flex flex-wrap gap-2">
        {AMLOU_CITIES.map((city) => {
          const label =
            locale === "fr"
              ? city.nameFr
              : locale === "en"
                ? city.nameEn
                : city.nameAr;
          return (
            <li key={city.slug}>
              <Link
                href={localizedPath(locale, amlouCityPath(city.slug))}
                className={cn(
                  "inline-flex rounded-full border px-3 py-1.5 text-xs font-medium transition-colors hover:border-accent hover:text-accent",
                  city.tourist
                    ? "border-accent/30 bg-accent/10 text-accent-foreground"
                    : "border-border bg-secondary/50 text-foreground/80",
                )}
              >
                {label}
              </Link>
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
