"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Globe } from "lucide-react";

import { useTranslation } from "@/lib/i18n/language-provider";
import type { TranslationKey } from "@/lib/i18n/translations";
import { LANGUAGES, type Language } from "@/lib/i18n/types";
import { cn } from "@/lib/utils";

const LABELS: Record<Language, string> = {
  ar: "AR",
  fr: "FR",
  en: "EN",
};

const LANG_NAME_KEYS: Record<Language, TranslationKey> = {
  ar: "lang.ar",
  fr: "lang.fr",
  en: "lang.en",
};

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useTranslation();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onEscape);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={t("lang.select")}
        className={cn(
          "inline-flex h-9 min-h-9 min-w-[3.25rem] items-center justify-center gap-1 rounded-full",
          "border border-border/70 bg-card/80 px-2.5 text-xs font-bold tracking-wide text-foreground/90",
          "shadow-warm-sm backdrop-blur-sm transition-all",
          "hover:border-accent/40 hover:bg-secondary/80 hover:text-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2",
        )}
      >
        <Globe className="size-3.5 shrink-0 text-accent" strokeWidth={2} />
        <span>{LABELS[locale]}</span>
        <ChevronDown
          className={cn(
            "size-3 shrink-0 text-muted-foreground transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label={t("lang.select")}
          className={cn(
            "absolute end-0 top-[calc(100%+0.35rem)] z-[60] min-w-[7.5rem] overflow-hidden rounded-xl",
            "border border-border/80 bg-card py-1 shadow-warm-lg ring-1 ring-black/5",
          )}
        >
          {LANGUAGES.map((code) => (
            <li key={code} role="option" aria-selected={locale === code}>
              <button
                type="button"
                onClick={() => {
                  setLocale(code);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center justify-between gap-3 px-3 py-2 text-start text-xs font-semibold transition-colors",
                  locale === code
                    ? "bg-accent/12 text-accent"
                    : "text-foreground/85 hover:bg-secondary/70",
                )}
              >
                <span>{LABELS[code]}</span>
                <span className="text-2xs font-medium text-muted-foreground">
                  {t(LANG_NAME_KEYS[code])}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
