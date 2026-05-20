"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

import { Container, Section } from "@/components/layout/container";
import { MixedNutsJarVisual } from "@/components/product/mixed-nuts-jar-visual";
import {
  FAMILY_PACK_CONTENTS,
  FAMILY_PACK_CONTENTS_TITLE_AR,
  FAMILY_PACK_CONTENTS_TITLE_EN,
  type FamilyPackContentItem,
} from "@/lib/products/family-pack-contents";
import { staggerContainer, staggerItem, VIEWPORT } from "@/lib/animations";
import { cn } from "@/lib/utils";

function PackItemVisual({ item }: { item: FamilyPackContentItem }) {
  if (item.id === "mixed-nuts-honey") {
    return <MixedNutsJarVisual src={item.imageSrc} alt={item.imageAlt} />;
  }

  return (
    <div className="relative mx-auto flex aspect-square w-full max-w-[11rem] items-center justify-center sm:max-w-[12.5rem]">
      <div
        aria-hidden
        className="absolute inset-[18%] rounded-full bg-gradient-to-b from-amber-100/50 to-transparent"
      />
      <Image
        src={item.imageSrc}
        alt={item.imageAlt}
        width={400}
        height={400}
        sizes="(max-width: 640px) 140px, 160px"
        className="relative z-10 h-full w-auto max-h-full object-contain drop-shadow-[0_8px_18px_hsl(20_30%_10%/0.15)] transition-transform duration-500 group-hover:scale-[1.03]"
      />
    </div>
  );
}

function PackContentCard({ item }: { item: FamilyPackContentItem }) {
  return (
    <motion.article
      variants={staggerItem}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border border-foreground/10",
        "bg-gradient-to-b from-card via-card to-secondary/30",
        "shadow-warm-md ring-1 ring-border/50",
        "transition-all duration-500 ease-out",
        "hover:border-accent/45 hover:shadow-gold hover:ring-accent/25",
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
      />
      <div className="border-b border-border/40 bg-gradient-to-br from-[hsl(42_42%_97%)] to-[hsl(38_28%_93%)] px-4 pb-3 pt-5">
        <PackItemVisual item={item} />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4 sm:p-5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-base font-extrabold leading-snug text-foreground sm:text-lg">
            {item.nameAr}
          </h3>
          <span className="shrink-0 rounded-full border border-foreground/15 bg-foreground px-2.5 py-1 text-2xs font-bold tabular-nums text-primary-foreground">
            {item.size}
          </span>
        </div>
        <p className="text-2xs font-medium uppercase tracking-wider text-accent/90">
          {item.nameEn}
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {item.benefit}
        </p>
      </div>
    </motion.article>
  );
}

export function FamilyPackContentsSection() {
  return (
    <Section
      spacing="sm"
      className="border-t border-accent/15 bg-gradient-to-b from-background via-card/30 to-background pb-8 pt-6 sm:pb-10 sm:pt-8 lg:pb-12"
    >
      <Container size="lg">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT}
          className="mb-6 sm:mb-8"
        >
          <motion.div variants={staggerItem} className="flex items-center gap-2">
            <Sparkles className="size-4 text-accent" aria-hidden />
            <span className="text-2xs font-bold uppercase tracking-[0.2em] text-accent">
              {FAMILY_PACK_CONTENTS_TITLE_EN}
            </span>
          </motion.div>
          <motion.h2
            variants={staggerItem}
            className="text-display mt-2 text-2xl text-foreground sm:text-3xl"
          >
            {FAMILY_PACK_CONTENTS_TITLE_AR}
          </motion.h2>
          <motion.p
            variants={staggerItem}
            className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground"
          >
            أربعة منتجات أساسية من سوس — كل واحد بحجم عائلي 250 غ أو 250 مل، جاهزة
            لفطورك وضيافتك.
          </motion.p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT}
          className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 md:gap-6"
        >
          {FAMILY_PACK_CONTENTS.map((item) => (
            <PackContentCard key={item.id} item={item} />
          ))}
        </motion.div>
      </Container>
    </Section>
  );
}
