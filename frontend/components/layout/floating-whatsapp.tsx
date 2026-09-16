"use client";

import { MessageCircle } from "lucide-react";

import { useTranslation } from "@/lib/i18n/language-provider";
import { cn } from "@/lib/utils";

export function FloatingWhatsApp({
  whatsappDigits,
  className,
}: {
  /** Digits only, e.g. 2126... */
  whatsappDigits: string;
  className?: string;
}) {
  const { t } = useTranslation();
  const digits = whatsappDigits.replace(/\D/g, "");
  if (!digits) return null;

  const href = `https://wa.me/${digits}?text=${encodeURIComponent(t("whatsapp.prefill"))}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t("whatsapp.floatLabel")}
      className={cn(
        "fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] end-4 z-40",
        "inline-flex size-14 items-center justify-center rounded-full",
        "bg-[#25D366] text-white transition-transform hover:scale-105",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2",
        "lg:bottom-6",
        className,
      )}
    >
      <MessageCircle className="size-7" strokeWidth={2} />
    </a>
  );
}
