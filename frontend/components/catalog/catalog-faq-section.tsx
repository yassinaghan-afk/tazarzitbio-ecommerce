"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

import { Container, Section } from "@/components/layout/container";
import { SectionHeader } from "@/components/sections/section-header";
import { useTranslation } from "@/lib/i18n/language-provider";
import { getCatalogFaqs } from "@/lib/seo/default-faqs";
import { accordionContent, VIEWPORT } from "@/lib/animations";
import { cn } from "@/lib/utils";

/** AEO FAQ block for /products catalog pages. */
export function CatalogFaqSection() {
  const { locale, t } = useTranslation();
  const faqs = getCatalogFaqs(locale);
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <Section id="catalog-faq" spacing="lg" className="border-t border-border/60">
      <Container size="md">
        <SectionHeader
          label={t("faq.label")}
          title={t("faq.title")}
          description={
            locale === "fr"
              ? "Réponses directes avant d’acheter — livraison COD au Maroc."
              : locale === "en"
                ? "Direct answers before you buy — COD delivery across Morocco."
                : "إجابات مباشرة قبل الشراء — توصيل والدفع عند الاستلام في المغرب."
          }
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
                      animate="open"
                      exit="collapsed"
                      className="overflow-hidden"
                    >
                      <p className="border-t border-border/50 px-5 py-4 text-sm leading-relaxed text-muted-foreground">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}
