"use client";

import { motion } from "framer-motion";

import { Container, Section } from "@/components/layout/container";
import { SectionHeader } from "@/components/sections/section-header";
import { useTranslation } from "@/lib/i18n/language-provider";
import { getTransparencySteps } from "@/lib/i18n/home-content";
import { staggerContainer, staggerItem, VIEWPORT } from "@/lib/animations";

export function IngredientsSection() {
  const { t } = useTranslation();
  const transparencySteps = getTransparencySteps(t);

  return (
    <Section id="transparency" spacing="lg">
      <Container>
        <SectionHeader
          label={t("ingredients.label")}
          title={t("ingredients.title")}
          description={t("ingredients.desc")}
        />

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT}
          className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
        >
          {transparencySteps.map((step, i) => (
            <motion.article
              key={step.title}
              variants={staggerItem}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-warm-sm transition-shadow hover:shadow-warm-lg"
            >
              <span className="text-4xl" aria-hidden>
                {step.icon}
              </span>
              <span className="absolute end-4 top-4 text-3xl font-bold text-accent/15">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-4 text-lg font-bold text-foreground">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </motion.article>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={VIEWPORT}
          transition={{ delay: 0.2 }}
          className="mt-12 rounded-2xl border border-accent/20 bg-gradient-to-br from-accent/5 to-transparent p-8 text-center md:p-10"
        >
          <p className="text-lg font-bold text-foreground">
            {t("ingredients.promise")}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("ingredients.promiseSub")}
          </p>
        </motion.div>
      </Container>
    </Section>
  );
}
