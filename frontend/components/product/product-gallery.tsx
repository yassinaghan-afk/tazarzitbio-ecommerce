"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface GalleryImage {
  id: string;
  alt: string;
  gradient: string;
  emoji: string;
}

interface ProductGalleryProps {
  images: GalleryImage[];
  className?: string;
}

export function ProductGallery({ images, className }: ProductGalleryProps) {
  const [activeIdx, setActiveIdx] = useState(0);

  const prev = () => setActiveIdx((i) => (i === 0 ? images.length - 1 : i - 1));
  const next = () => setActiveIdx((i) => (i === images.length - 1 ? 0 : i + 1));

  const active = images[activeIdx];

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {/* Main image */}
      <div className="relative aspect-square overflow-hidden rounded-3xl border border-border shadow-warm-lg">
        <AnimatePresence mode="wait">
          <motion.div
            key={active.id}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              "absolute inset-0 flex flex-col items-center justify-center gap-4 bg-gradient-to-br p-8",
              active.gradient,
            )}
          >
            <span className="text-8xl drop-shadow-md" aria-hidden>
              {active.emoji}
            </span>
            <p className="text-sm font-medium text-foreground/70">{active.alt}</p>
          </motion.div>
        </AnimatePresence>

        {/* Arrow nav */}
        {images.length > 1 && (
          <>
            <Button
              variant="light"
              size="icon-sm"
              onClick={prev}
              aria-label="الصورة السابقة"
              className="absolute start-3 top-1/2 -translate-y-1/2 bg-white/80 text-foreground backdrop-blur-sm hover:bg-white shadow-warm-sm"
            >
              <ChevronRight className="size-4" />
            </Button>
            <Button
              variant="light"
              size="icon-sm"
              onClick={next}
              aria-label="الصورة التالية"
              className="absolute end-3 top-1/2 -translate-y-1/2 bg-white/80 text-foreground backdrop-blur-sm hover:bg-white shadow-warm-sm"
            >
              <ChevronLeft className="size-4" />
            </Button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {images.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setActiveIdx(i)}
              aria-label={img.alt}
              className={cn(
                "relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 transition-all duration-200",
                i === activeIdx
                  ? "border-accent shadow-gold"
                  : "border-transparent hover:border-border",
              )}
            >
              <div
                className={cn(
                  "absolute inset-0 flex items-center justify-center bg-gradient-to-br text-2xl",
                  img.gradient,
                )}
              >
                {img.emoji}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Dot indicators (mobile) */}
      {images.length > 1 && (
        <div className="flex justify-center gap-1.5">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIdx(i)}
              aria-label={`الصورة ${i + 1}`}
              className={cn(
                "h-1.5 rounded-full transition-all duration-200",
                i === activeIdx ? "w-5 bg-accent" : "w-1.5 bg-border",
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
