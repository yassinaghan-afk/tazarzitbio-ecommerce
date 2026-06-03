"use client";

import { Banknote, Home, Phone } from "lucide-react";

import { formatMoroccanPhoneDisplay } from "@/lib/checkout/validation";
import { useTranslation } from "@/lib/i18n/language-provider";
import { cn } from "@/lib/utils";

interface CheckoutConfirmationCardProps {
  phone: string;
  address: string;
  total: number;
  className?: string;
}

export function CheckoutConfirmationCard({
  phone,
  address,
  total,
  className,
}: CheckoutConfirmationCardProps) {
  const { t } = useTranslation();
  const displayPhone = formatMoroccanPhoneDisplay(phone);

  return (
    <div className={cn("space-y-4", className)}>
      <p className="text-center text-sm leading-relaxed text-muted-foreground">
        {t("confirmCard.hint")}
      </p>

      <div className="glass-card overflow-hidden rounded-2xl border border-accent/25 bg-gradient-to-br from-amber-50/90 via-card to-orange-50/50 p-5 shadow-warm-lg">
        <div className="mb-4 flex items-center justify-center gap-2 rounded-full bg-accent/10 px-3 py-1.5 text-xs font-semibold text-accent">
          <Banknote className="size-3.5" />
          {t("confirmCard.cod")}
        </div>

        <div className="space-y-4">
          <div>
            <div className="mb-1.5 flex items-center gap-2 text-xs font-bold text-muted-foreground">
              <Phone className="size-4 text-accent" aria-hidden />
              <span>{t("confirmCard.phone")}</span>
            </div>
            <p
              dir="ltr"
              className="text-2xl font-extrabold tabular-nums tracking-wide text-foreground sm:text-3xl"
            >
              {displayPhone}
            </p>
          </div>

          <div className="gold-divider" />

          <div>
            <div className="mb-1.5 flex items-center gap-2 text-xs font-bold text-muted-foreground">
              <Home className="size-4 text-accent" aria-hidden />
              <span>{t("confirmCard.address")}</span>
            </div>
            <p className="text-base font-bold leading-relaxed text-foreground sm:text-lg">
              {address.trim()}
            </p>
          </div>

          <div className="gold-divider" />

          <div className="flex items-end justify-between gap-4 rounded-xl bg-accent/10 px-4 py-3">
            <div className="flex items-center gap-2 text-sm font-bold text-foreground">
              <span aria-hidden>💰</span>
              <span>{t("confirmCard.total")}</span>
            </div>
            <p className="text-3xl font-extrabold tabular-nums text-accent">
              {total}
              <span className="ms-1 text-lg font-bold">{t("common.currency")}</span>
            </p>
          </div>
        </div>

        <p className="mt-4 text-center text-2xs leading-relaxed text-muted-foreground">
          {t("confirmCard.footer")}
        </p>
      </div>
    </div>
  );
}
