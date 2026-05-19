"use client";

import { motion } from "framer-motion";

import { Container, Section } from "@/components/layout/container";
import { SectionHeader } from "@/components/sections/section-header";
import { lifestyleMoments } from "@/lib/home-data";
import { staggerContainer, staggerItem, VIEWPORT } from "@/lib/animations";
import { cn } from "@/lib/utils";

export function LifestyleSection() {
  return (
    <Section id="lifestyle" spacing="lg" bg="alt">
      <Container>
        <SectionHeader
          label="أسلوب الحياة"
          title="لحظات مغربية دافئة"
          description="منتجاتنا جزء من طقوس يومية — فطور، ضيافة، واحتفال — بلمسة فاخرة وطبيعية."
        />

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT}
          className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
        >
          {lifestyleMoments.map((moment) => (
            <motion.article
              key={moment.title}
              variants={staggerItem}
              whileHover={{ y: -6, transition: { duration: 0.25 } }}
              className="group overflow-hidden rounded-2xl border border-border bg-card shadow-warm-sm"
            >
              <div
                className={cn(
                  "flex aspect-[4/3] flex-col items-center justify-center gap-3 bg-gradient-to-br p-6 text-center transition-transform duration-500 group-hover:scale-[1.02]",
                  moment.gradient,
                )}
              >
                <span className="text-5xl drop-shadow-sm" aria-hidden>
                  {moment.emoji}
                </span>
                <p className="text-xs font-medium text-muted-foreground/80">
                  صورة قريباً
                </p>
              </div>
              <div className="p-5">
                <h3 className="font-bold text-foreground">{moment.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {moment.description}
                </p>
              </div>
            </motion.article>
          ))}
        </motion.div>

        <motion.blockquote
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={VIEWPORT}
          className="mt-14 border-s-4 border-accent ps-6 text-lg font-medium italic text-foreground/80 md:text-xl"
        >
          «الضيافة المغربية ليست عادة — إنها فن. ونحن نقدّم لكم أفضل ما في سوس
          لتحييوا به من تحبون.»
          <footer className="mt-3 text-sm font-normal not-italic text-muted-foreground">
            — فريق تازارزيت بيو
          </footer>
        </motion.blockquote>
      </Container>
    </Section>
  );
}
