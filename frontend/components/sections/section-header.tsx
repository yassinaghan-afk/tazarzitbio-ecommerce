"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { fadeUp, VIEWPORT } from "@/lib/animations";

interface SectionHeaderProps {
  label?: string;
  title: string;
  description?: string;
  align?: "start" | "center";
  className?: string;
}

export function SectionHeader({
  label,
  title,
  description,
  align = "center",
  className,
}: SectionHeaderProps) {
  const isCenter = align === "center";

  return (
    <motion.header
      initial="hidden"
      whileInView="visible"
      viewport={VIEWPORT}
      variants={fadeUp}
      className={cn(
        "mb-14 md:mb-20",
        isCenter && "mx-auto max-w-2xl text-center",
        className,
      )}
    >
      {label && (
        <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-accent">
          <span className="h-px w-6 bg-accent/50" aria-hidden />
          {label}
          {isCenter && <span className="h-px w-6 bg-accent/50" aria-hidden />}
        </p>
      )}
      <h2
        className={cn(
          "mt-3 text-balance font-extrabold tracking-tight text-foreground",
          isCenter ? "text-3xl md:text-4xl lg:text-[2.75rem]" : "text-2xl md:text-3xl",
        )}
      >
        {title}
      </h2>
      {description && (
        <p
          className={cn(
            "mt-4 text-base leading-[1.85] text-muted-foreground md:text-lg",
            isCenter && "mx-auto max-w-xl",
          )}
        >
          {description}
        </p>
      )}
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={VIEWPORT}
        transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          "mt-8 h-[3px] w-20 origin-center rounded-full bg-gold-gradient shadow-gold",
          isCenter && "mx-auto",
        )}
      />
    </motion.header>
  );
}
