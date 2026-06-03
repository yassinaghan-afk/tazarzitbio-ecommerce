"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, MessageCircle } from "lucide-react";

import { Container, Section } from "@/components/layout/container";
import { SectionHeader } from "@/components/sections/section-header";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n/language-provider";
import { getFaqs } from "@/lib/i18n/home-content";
import { accordionContent, VIEWPORT } from "@/lib/animations";
import { cn } from "@/lib/utils";

export function FaqSection() {
  const { t } = useTranslation();
  const faqs = getFaqs(t);
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <Section id="faq" spacing="lg">
      <Container size="md">
        <SectionHeader
          label={t("faq.label")}
          title={t("faq.title")}
          description={t("faq.desc")}
        />

        <div className="space-y-3">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <motion.div
                key={faq.q}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={VIEWPORT}
                transition={{ delay: i * 0.04, duration: 0.35 }}
                className={cn(
                  "overflow-hidden rounded-xl border transition-all duration-200",
                  isOpen
                    ? "border-accent/30 bg-card shadow-warm-md"
                    : "border-border bg-card/80 hover:border-border/80",
                )}
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="flex min-h-11 w-full items-center justify-between gap-4 px-5 py-4 text-start"
                  aria-expanded={isOpen}
                >
                  <span className="text-sm font-semibold text-foreground sm:text-base">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={cn(
                      "size-5 shrink-0 text-muted-foreground transition-transform duration-300",
                      isOpen && "rotate-180 text-accent",
                    )}
                  />
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="content"
                      variants={accordionContent}
                      initial="collapsed"
                      animate="expanded"
                      exit="collapsed"
                      style={{ overflow: "hidden" }}
                    >
                      <p className="border-t border-border/60 px-5 py-4 text-sm leading-relaxed text-muted-foreground">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={VIEWPORT}
          className="mt-10 flex flex-col items-center gap-4 rounded-2xl border border-border bg-secondary/40 p-8 text-center"
        >
          <MessageCircle className="size-8 text-accent" />
          <p className="font-semibold text-foreground">{t("faq.notFound")}</p>
          <p className="text-sm text-muted-foreground">{t("faq.contact")}</p>
          <Button variant="gold" className="min-h-11 gap-2">
            <MessageCircle className="size-4" />
            {t("faq.whatsapp")}
          </Button>
        </motion.div>
      </Container>
    </Section>
  );
}
