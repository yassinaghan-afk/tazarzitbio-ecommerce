"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ShoppingBag, X, Zap } from "lucide-react";
import { useEffect, useState } from "react";

import { useCommerce } from "@/components/providers/commerce-provider";
import { Button } from "@/components/ui/button";
import {
  buildAddToCartPayload,
  getStartingOffer,
} from "@/lib/cart/product-payload";
import { useTranslation } from "@/lib/i18n/language-provider";
import type { PublicProduct, PublicProductOffer } from "@/lib/products/types";
import { cn } from "@/lib/utils";

type Mode = "order" | "cart";

interface WeightOfferModalProps {
  product: PublicProduct | null;
  open: boolean;
  onClose: () => void;
  /** Default: order → checkout drawer */
  mode?: Mode;
  /** When set, bypasses cart/checkout and returns the chosen offer */
  onConfirmOffer?: (offer: PublicProductOffer) => void;
  /** Override primary CTA label */
  confirmLabel?: string;
}

export function WeightOfferModal({
  product,
  open,
  onClose,
  mode = "order",
  onConfirmOffer,
  confirmLabel,
}: WeightOfferModalProps) {
  const { t } = useTranslation();
  const commerce = useCommerce();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !product) return;
    setSelectedId(getStartingOffer(product).id);
  }, [open, product]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  const selected: PublicProductOffer | undefined =
    product?.offers.find((o) => o.id === selectedId) ?? product?.offers[0];

  function confirm() {
    if (!product || !selected) return;
    if (onConfirmOffer) {
      onConfirmOffer(selected);
      onClose();
      return;
    }
    const payload = buildAddToCartPayload(product, selected);
    if (mode === "cart") {
      commerce.addToCart({ ...payload, openDrawer: "cart" });
    } else {
      commerce.orderNow(payload);
    }
    onClose();
  }

  const primaryLabel =
    confirmLabel ??
    (mode === "cart" ? t("weightModal.addToCart") : t("weightModal.continue"));
  const showCartIcon = Boolean(onConfirmOffer) || mode === "cart";

  return (
    <AnimatePresence>
      {open && product && selected && (
        <>
          <motion.button
            type="button"
            aria-label={t("weightModal.close")}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[80] bg-[#1a120a]/55 backdrop-blur-[6px]"
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="weight-modal-title"
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 28, scale: 0.97 }}
            transition={{ type: "spring", damping: 26, stiffness: 320 }}
            className="fixed inset-x-3 bottom-3 z-[90] mx-auto flex max-h-[min(92dvh,720px)] w-full max-w-md flex-col overflow-hidden rounded-[1.75rem] border border-[#e8dcc8] bg-[#fffaf3] shadow-[0_28px_80px_-24px_rgba(40,24,8,0.55)] sm:inset-x-auto sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:w-[28rem] sm:-translate-x-1/2 sm:-translate-y-1/2"
          >
            <div className="relative overflow-hidden bg-gradient-to-br from-[#3d2818] via-[#5a3a1f] to-[#2a1810] px-5 pb-5 pt-4 text-white">
              <div
                aria-hidden
                className="pointer-events-none absolute -end-10 -top-10 size-40 rounded-full bg-accent/25 blur-3xl"
              />
              <div className="relative flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/55">
                    {t("weightModal.kicker")}
                  </p>
                  <h2
                    id="weight-modal-title"
                    className="mt-1 text-xl font-extrabold leading-snug"
                  >
                    {product.nameAr}
                  </h2>
                  <p className="mt-1 text-sm text-white/70">
                    {t("weightModal.subtitle")}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  aria-label={t("weightModal.close")}
                  className="shrink-0 rounded-full text-white hover:bg-white/15 hover:text-white"
                >
                  <X className="size-5" />
                </Button>
              </div>

              <div className="relative mt-4 flex items-center gap-3 rounded-2xl bg-white/10 p-3 ring-1 ring-white/15">
                <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-white/10">
                  <Image
                    src={product.image}
                    alt={product.nameAr}
                    fill
                    sizes="64px"
                    className="object-contain p-1.5"
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-white/60">{t("weightModal.selected")}</p>
                  <p className="truncate text-sm font-bold">{selected.label}</p>
                  <p className="mt-0.5 text-lg font-extrabold tabular-nums text-accent">
                    {selected.price}
                    <span className="ms-1 text-sm font-semibold text-white/80">
                      {t("common.currency")}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            <div className="max-h-[min(46dvh,360px)] space-y-2.5 overflow-y-auto overscroll-contain px-4 py-4">
              {product.offers.map((offer) => {
                const isSelected = offer.id === selected.id;
                return (
                  <button
                    key={offer.id}
                    type="button"
                    onClick={() => setSelectedId(offer.id)}
                    aria-pressed={isSelected}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-2xl border px-3.5 py-3.5 text-start transition-all",
                      isSelected
                        ? "border-accent bg-accent/10 shadow-[0_10px_28px_-16px_hsl(45_80%_45%/0.7)] ring-2 ring-accent/35"
                        : "border-[#eadfce] bg-white hover:border-[#d4c2a4]",
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-6 shrink-0 items-center justify-center rounded-full border-2",
                        isSelected
                          ? "border-accent bg-accent text-[#2a1810]"
                          : "border-[#d6c8b2] bg-transparent",
                      )}
                    >
                      {isSelected && <Check className="size-3.5" strokeWidth={3} />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-extrabold text-foreground">
                        {offer.weight || offer.label}
                      </span>
                      {offer.hint && (
                        <span className="mt-0.5 block text-xs text-muted-foreground">
                          {offer.hint}
                        </span>
                      )}
                    </span>
                    <span className="shrink-0 text-end">
                      <span className="block text-base font-extrabold tabular-nums text-accent">
                        {offer.price}
                        <span className="ms-1 text-xs font-semibold text-muted-foreground">
                          {t("common.currency")}
                        </span>
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="border-t border-[#eadfce] bg-[#fff7eb] px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
              <Button
                type="button"
                variant="gold"
                size="xl"
                className="min-h-12 w-full gap-2 rounded-full text-base font-extrabold shadow-gold"
                onClick={confirm}
              >
                {showCartIcon ? (
                  <ShoppingBag className="size-5" />
                ) : (
                  <Zap className="size-5" />
                )}
                {primaryLabel}
                <span className="ms-1 tabular-nums opacity-90">
                  · {selected.price} {t("common.currency")}
                </span>
              </Button>
              <p className="mt-2.5 text-center text-[11px] text-muted-foreground">
                {t("common.cod")}
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
