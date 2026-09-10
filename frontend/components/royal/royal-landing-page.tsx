"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import { RoyalOrderModal } from "@/components/royal/royal-order-modal";
import { RoyalOrderSection } from "@/components/royal/royal-order-section";
import { Button } from "@/components/ui/button";
import {
  AMLOU_ROYAL_DEFAULT_OFFER_ID,
  AMLOU_ROYAL_LP_IMAGES,
  AMLOU_ROYAL_NAME_AR,
} from "@/lib/products/amlou-royal";
import { trackViewContent } from "@/lib/tracking/events";

const [HERO_IMAGE, ...STORY_IMAGES] = AMLOU_ROYAL_LP_IMAGES;

function LpPanel({
  src,
  alt,
  width,
  height,
  priority = false,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  priority?: boolean;
}) {
  return (
    <div className="mx-auto w-full max-w-lg">
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        sizes="(max-width: 512px) 100vw, 512px"
        className="h-auto w-full"
      />
    </div>
  );
}

export function RoyalLandingPage() {
  const [orderOpen, setOrderOpen] = useState(false);

  useEffect(() => {
    document.body.classList.add("royal-lp");
    return () => document.body.classList.remove("royal-lp");
  }, []);

  useEffect(() => {
    trackViewContent({
      productId: "amlou-royal",
      slug: "amlou-royal",
      name: AMLOU_ROYAL_NAME_AR,
      price: 249,
    });
  }, []);

  function openOrderFlow() {
    setOrderOpen(true);
  }

  return (
    <div className="bg-[#faf6ef] text-foreground">
      <RoyalOrderModal
        open={orderOpen}
        onClose={() => setOrderOpen(false)}
        initialOfferId={AMLOU_ROYAL_DEFAULT_OFFER_ID}
      />

      {/* 1 — Hero */}
      <section className="w-full bg-[#c9921a]" aria-label="أملو ملكي">
        <h1 className="sr-only">أملو ملكي — مذاق فاخر من مكونات طبيعية</h1>
        <LpPanel
          src={HERO_IMAGE.src}
          alt={HERO_IMAGE.alt}
          width={HERO_IMAGE.width}
          height={HERO_IMAGE.height}
          priority
        />
      </section>

      {/* Order form right after hero */}
      <section id="order" className="scroll-mt-0 bg-[#faf6ef] px-3 py-5 sm:px-4">
        <div className="mx-auto w-full max-w-md">
          <RoyalOrderSection embedded />
        </div>
      </section>

      {/* 2 → 9 — story panels in order */}
      {STORY_IMAGES.map((panel) => (
        <section key={panel.src} className="w-full">
          <LpPanel
            src={panel.src}
            alt={panel.alt}
            width={panel.width}
            height={panel.height}
          />
        </section>
      ))}

      <section className="bg-[#faf6ef] px-3 py-8 text-center">
        <Button
          size="lg"
          onClick={openOrderFlow}
          className="min-h-12 w-full max-w-md rounded-full bg-red-600 font-extrabold text-white hover:bg-red-700"
        >
          اطلب الآن
        </Button>
      </section>

      <div className="h-14 lg:hidden" />
      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-neutral-200 bg-white/95 p-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))] backdrop-blur-md lg:hidden">
        <Button
          size="lg"
          onClick={openOrderFlow}
          className="min-h-11 w-full rounded-full bg-red-600 font-extrabold text-white hover:bg-red-700"
        >
          اطلب الآن
        </Button>
      </div>
    </div>
  );
}
