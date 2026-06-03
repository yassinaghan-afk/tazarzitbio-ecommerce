"use client";

import Image from "next/image";
import { motion } from "framer-motion";

import { useTranslation } from "@/lib/i18n/language-provider";
import { cn } from "@/lib/utils";

interface HeroBundleImageProps {
  className?: string;
}

export function HeroBundleImage({ className }: HeroBundleImageProps) {
  const { t } = useTranslation();

  return (
    <div className={cn("relative mx-auto w-full max-w-[min(100%,28rem)]", className)}>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(circle,hsl(42_75%_50%/0.35)_0%,transparent_65%)] blur-2xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[2rem] bg-gradient-to-b from-[hsl(45_90%_60%/0.12)] via-transparent to-[#2a1810]/20"
      />

      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
        className="frame-premium relative aspect-square overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#3d2818] via-[#4a3020] to-[#2a1810] shadow-warm-xl sm:rounded-[2.25rem]"
      >
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_15%,hsl(45_85%_58%/0.25)_0%,transparent_50%)]"
        />
        <Image
          src="/images/products/pack.png"
          alt={t("hero.bundleAlt")}
          fill
          priority
          sizes="(max-width: 768px) 92vw, (max-width: 1200px) 45vw, 32rem"
          className="object-contain object-center p-4 sm:p-6"
          quality={92}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#1a1008]/40 via-transparent to-[hsl(45_80%_55%/0.1)]"
        />
      </motion.div>
    </div>
  );
}
