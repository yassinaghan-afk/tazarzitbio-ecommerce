"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

import { Container, Section } from "@/components/layout/container";
import { SectionHeader } from "@/components/sections/section-header";
import { useTranslation } from "@/lib/i18n/language-provider";
import { getStoryPillars, getStoryValues } from "@/lib/i18n/home-content";
import { slideInEnd, slideInStart, staggerContainer, staggerItem, VIEWPORT } from "@/lib/animations";

export function StorySection() {
  const { t } = useTranslation();
  const values = getStoryValues(t);
  const pillars = getStoryPillars(t);

  return (
    <Section id="story" spacing="lg">
      <Container>
        <SectionHeader
          label={t("story.label")}
          title={t("story.title")}
          description={t("story.desc")}
          align="center"
        />

        <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
          <motion.div
            variants={slideInStart}
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT}
          >
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl border border-border/40 bg-card shadow-warm-xl">
              <Image
                src="/images/sections/tazar.jpeg"
                alt={t("story.caption")}
                fill
                className="object-cover object-center"
                sizes="(max-width: 1024px) 100vw, 560px"
                quality={90}
              />
              <div
                aria-hidden
                className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-black/5"
              />
              <div className="absolute bottom-0 inset-x-0 p-5">
                <p className="rounded-2xl border border-white/20 bg-black/35 px-4 py-3 text-center text-sm font-semibold text-white backdrop-blur-sm">
                  {t("story.caption")}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={slideInEnd}
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT}
            className="flex flex-col gap-8"
          >
            <p className="text-lg leading-relaxed text-muted-foreground">
              {t("story.body")}
            </p>

            <ul className="space-y-3">
              {values.map((v) => (
                <li key={v} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-accent" />
                  <span className="text-sm text-foreground/85">{v}</span>
                </li>
              ))}
            </ul>

            <motion.ol
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={VIEWPORT}
              className="grid gap-4 sm:grid-cols-2"
            >
              {pillars.map((pillar) => (
                <motion.li
                  key={pillar.step}
                  variants={staggerItem}
                  className="rounded-xl border border-border bg-card p-4 shadow-warm-sm"
                >
                  <span className="text-xs font-bold text-accent">{pillar.step}</span>
                  <p className="mt-1 font-bold text-foreground">{pillar.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {pillar.description}
                  </p>
                </motion.li>
              ))}
            </motion.ol>
          </motion.div>
        </div>
      </Container>
    </Section>
  );
}
