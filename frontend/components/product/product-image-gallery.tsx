"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ProductImageGalleryProps {
  images: string[];
  alt: string;
  className?: string;
}

export function ProductImageGallery({
  images,
  alt,
  className,
}: ProductImageGalleryProps) {
  const [activeIdx, setActiveIdx] = useState(0);
  const list = images.length > 0 ? images : ["/images/products/pack.png"];

  const prev = () =>
    setActiveIdx((i) => (i === 0 ? list.length - 1 : i - 1));
  const next = () =>
    setActiveIdx((i) => (i === list.length - 1 ? 0 : i + 1));

  const active = list[activeIdx];

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div className="frame-premium relative aspect-square overflow-hidden rounded-3xl bg-gradient-to-br from-[#3d2818] via-[#4a3020] to-[#2a1810] shadow-warm-xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0"
          >
            <div
              aria-hidden
              className="absolute inset-0 bg-[radial-gradient(ellipse_at_40%_25%,hsl(45_80%_55%/0.2)_0%,transparent_55%)]"
            />
            <Image
              src={active}
              alt={alt}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-contain object-center p-5 sm:p-8"
              quality={90}
            />
          </motion.div>
        </AnimatePresence>

        {list.length > 1 && (
          <>
            <Button
              variant="light"
              size="icon-sm"
              onClick={prev}
              aria-label="الصورة السابقة"
              className="absolute start-3 top-1/2 z-10 -translate-y-1/2 bg-white/85 text-foreground shadow-warm-sm"
            >
              <ChevronRight className="size-4" />
            </Button>
            <Button
              variant="light"
              size="icon-sm"
              onClick={next}
              aria-label="الصورة التالية"
              className="absolute end-3 top-1/2 z-10 -translate-y-1/2 bg-white/85 text-foreground shadow-warm-sm"
            >
              <ChevronLeft className="size-4" />
            </Button>
          </>
        )}
      </div>

      {list.length > 1 && (
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {list.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setActiveIdx(i)}
              aria-label={`صورة ${i + 1}`}
              className={cn(
                "relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 transition-all",
                i === activeIdx
                  ? "border-accent shadow-gold"
                  : "border-transparent hover:border-border",
              )}
            >
              <Image
                src={src}
                alt=""
                fill
                sizes="64px"
                className="object-contain bg-gradient-to-br from-[#3d2818] to-[#2a1810] p-1"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
