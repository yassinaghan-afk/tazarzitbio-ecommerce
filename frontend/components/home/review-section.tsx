"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";

import { Container, Section } from "@/components/layout/container";
import { ReviewCard } from "@/components/reviews/review-card";
import { SectionHeader } from "@/components/sections/section-header";
import { reviews } from "@/lib/home-data";
import { useTranslation } from "@/lib/i18n/language-provider";
import { getMoroccanCitiesLabel } from "@/lib/i18n/home-content";
import { staggerContainer, staggerItem, VIEWPORT } from "@/lib/animations";

export function ReviewSection() {
  const { t, locale } = useTranslation();

  return (
    <Section id="reviews" spacing="lg" bg="alt">
      <Container>
        <SectionHeader
          label={t("reviews.label")}
          title={t("reviews.title")}
          description={t("reviews.desc")}
        />

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={VIEWPORT}
          className="mb-10 flex flex-col items-center gap-4"
        >
          <div className="inline-flex items-center gap-3 rounded-full border border-accent/30 bg-card px-6 py-3 shadow-warm-sm">
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="size-5 fill-accent text-accent" />
              ))}
            </div>
            <span className="text-lg font-bold">4.9</span>
            <span className="text-sm text-muted-foreground">
              {t("reviews.ratingLabel")}
            </span>
          </div>

          <p className="text-center text-xs text-muted-foreground">
            {t("reviews.citiesPrefix")} {getMoroccanCitiesLabel(locale)}
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT}
          className="grid gap-5 md:grid-cols-2"
        >
          {reviews.map((review) => (
            <motion.div key={review.id} variants={staggerItem}>
              <ReviewCard
                author={review.author}
                city={review.city}
                rating={review.rating}
                date={review.date}
                content={review.content}
                product={review.product}
              />
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={VIEWPORT}
          transition={{ delay: 0.2 }}
          className="mt-12 rounded-2xl border border-dashed border-border bg-card/50 p-8 text-center"
        >
          <p className="text-sm font-semibold text-foreground">
            {t("reviews.ugcTitle")}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">{t("reviews.ugcDesc")}</p>
          <div className="mt-6 flex justify-center gap-3">
            {["📸", "🫙", "🍯", "🎁", "✨", "🌿"].map((e) => (
              <span
                key={e}
                className="flex h-14 w-14 items-center justify-center rounded-xl bg-secondary text-2xl"
                aria-hidden
              >
                {e}
              </span>
            ))}
          </div>
        </motion.div>
      </Container>
    </Section>
  );
}
