"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import { RoyalFrOrderModal } from "@/components/royal/royal-fr-order-modal";
import { RoyalFrOrderSection } from "@/components/royal/royal-fr-order-section";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n/language-provider";
import { LANGUAGE_STORAGE_KEY, type Language } from "@/lib/i18n/types";
import { AMLOU_ROYAL_DEFAULT_OFFER_ID } from "@/lib/products/amlou-royal";
import {
  AMLOU_ROYAL_FR_IMAGES,
  AMLOU_ROYAL_FR_NAME,
  royalFrCopy as t,
} from "@/lib/royal/fr-copy";
import { trackViewContent } from "@/lib/tracking/events";

function LpPanel({
  src,
  alt,
  width,
  height,
  priority = false,
  quality = 85,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  priority?: boolean;
  quality?: number;
}) {
  return (
    <div className="mx-auto w-full max-w-lg">
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        quality={quality}
        sizes="(max-width: 640px) 100vw, 640px"
        className="h-auto w-full"
      />
    </div>
  );
}

export function RoyalFrLandingPage() {
  const [orderOpen, setOrderOpen] = useState(false);
  const { setLocale } = useLanguage();

  useEffect(() => {
    document.body.classList.add("royal-lp");
    const prevLang = document.documentElement.lang;
    const prevDir = document.documentElement.dir;
    let previousLocale: Language = "ar";
    try {
      const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (stored === "ar" || stored === "fr" || stored === "en") {
        previousLocale = stored;
      }
    } catch {
      /* ignore */
    }
    document.documentElement.lang = "fr";
    document.documentElement.dir = "ltr";
    setLocale("fr");
    return () => {
      document.body.classList.remove("royal-lp");
      document.documentElement.lang = prevLang;
      document.documentElement.dir = prevDir;
      setLocale(previousLocale);
    };
  }, [setLocale]);

  useEffect(() => {
    trackViewContent({
      productId: "amlou-royal",
      slug: "amlou-royal",
      name: AMLOU_ROYAL_FR_NAME,
      price: 249,
    });
  }, []);

  function openOrderFlow() {
    setOrderOpen(true);
  }

  const hero = AMLOU_ROYAL_FR_IMAGES.hero;
  const afterForm = AMLOU_ROYAL_FR_IMAGES.afterForm;

  return (
    <div className="bg-[#faf6ef] text-foreground" dir="ltr" lang="fr">
      <RoyalFrOrderModal
        open={orderOpen}
        onClose={() => setOrderOpen(false)}
        initialOfferId={AMLOU_ROYAL_DEFAULT_OFFER_ID}
      />

      {/* 1 — Hero (French creative only) */}
      <section className="w-full bg-[#f5f0e6]" aria-label={t.heroAria}>
        <h1 className="sr-only">{t.heroTitle}</h1>
        <LpPanel
          src={hero.src}
          alt={hero.alt}
          width={hero.width}
          height={hero.height}
          priority
          quality={95}
        />
      </section>

      {/* Order form */}
      <section id="order" className="scroll-mt-0 bg-[#faf6ef] px-3 py-5 sm:px-4">
        <div className="mx-auto w-full max-w-md">
          <RoyalFrOrderSection embedded />
        </div>
      </section>

      {/* 2 — Ingredients panel under the form */}
      <section className="w-full bg-[#f5f0e6]" aria-label="Ingrédients Amlou Royal">
        <LpPanel
          src={afterForm.src}
          alt={afterForm.alt}
          width={afterForm.width}
          height={afterForm.height}
          quality={92}
        />
      </section>

      <section className="bg-[#faf6ef] px-3 py-8 text-center">
        <Button
          size="lg"
          onClick={openOrderFlow}
          className="min-h-12 w-full max-w-md rounded-full bg-red-600 font-extrabold uppercase tracking-wide text-white hover:bg-red-700"
        >
          {t.ctaOrder}
        </Button>
      </section>

      <div className="h-14 lg:hidden" />
      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-neutral-200 bg-white/95 p-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))] backdrop-blur-md lg:hidden">
        <Button
          size="lg"
          onClick={openOrderFlow}
          className="min-h-11 w-full rounded-full bg-red-600 font-extrabold uppercase tracking-wide text-white hover:bg-red-700"
        >
          {t.ctaOrder}
        </Button>
      </div>
    </div>
  );
}
