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
        "mb-12 md:mb-16",
        isCenter && "mx-auto max-w-2xl text-center",
        className,
      )}
    >
      {label && (
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">
          {label}
        </p>
      )}
      <h2
        className={cn(
          "mt-2 font-bold text-foreground text-balance",
          isCenter ? "text-3xl md:text-4xl lg:text-5xl" : "text-2xl md:text-3xl",
        )}
      >
        {title}
      </h2>
      {description && (
        <p
          className={cn(
            "mt-4 text-base leading-relaxed text-muted-foreground md:text-lg",
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
        transition={{ duration: 0.6, delay: 0.2 }}
        className={cn(
          "mt-6 h-0.5 w-16 origin-center rounded-full bg-gold-gradient",
          isCenter && "mx-auto",
        )}
      />
    </motion.header>
  );
}
