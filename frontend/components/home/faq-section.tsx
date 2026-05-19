"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

import { Container, Section } from "@/components/layout/container";
import { accordionContent } from "@/lib/animations";
import { cn } from "@/lib/utils";

const faqs = [
  {
    q: "هل المنتجات طبيعية 100%؟",
    a: "نعم، جميع منتجاتنا طبيعية 100% دون إضافات صناعية أو حافظات. نختار مكوناتنا بعناية من منطقة سوس بالمغرب.",
  },
  {
    q: "كيف يتم الدفع؟",
    a: "الدفع عند الاستلام فقط. لا نطلب أي بطاقة بنكية أو دفع مسبق. تدفع المبلغ نقداً عند استلام طلبك.",
  },
  {
    q: "ما هي مدة التوصيل؟",
    a: "يختلف وقت التوصيل حسب المدينة: المدن الكبرى (الدار البيضاء، الرباط، مراكش) من يوم إلى ثلاثة أيام. المدن الأخرى من ثلاثة إلى خمسة أيام عمل.",
  },
  {
    q: "هل يمكنني إرجاع المنتج؟",
    a: "في حال وجود مشكلة في المنتج أو تلف أثناء الشحن، نلتزم بالاستبدال الكامل. تواصل معنا خلال 24 ساعة من الاستلام.",
  },
  {
    q: "هل علب الهدايا مناسبة للمناسبات؟",
    a: "بالتأكيد! علب هداياتنا مصممة بعناية لتكون هدية فاخرة في عيد الفطر والأضحى والأفراح والمناسبات العائلية.",
  },
  {
    q: "كيف يمكنني تتبع طلبي؟",
    a: "بعد تأكيد الطلب، سنتصل بك لتحديد موعد التوصيل. يمكنك أيضاً التواصل معنا عبر واتساب لمعرفة حالة طلبك.",
  },
  {
    q: "هل تتوفر عروض للجملة أو للشركات؟",
    a: "نعم، لدينا عروض خاصة للطلبات الكبيرة والمؤسسات. تواصل معنا مباشرة عبر واتساب أو الهاتف للحصول على عرض سعر.",
  },
  {
    q: "ما هو الفرق بين أنواع الأملو؟",
    a: "أملو الكلاسيكي مصنوع من زيت أركان والعسل ولوز سوس. أملو بالفستق يضيف فستقاً مطحوناً لنكهة أكثر ثراءً. كلاهما طبيعي 100% وأصيل من سوس.",
  },
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <Section id="faq" spacing="lg" bg="alt">
      <Container size="md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center"
        >
          <p className="text-sm font-semibold uppercase tracking-widest text-accent">
            الأسئلة الشائعة
          </p>
          <h2 className="mt-2 text-3xl font-bold text-foreground md:text-4xl">
            كل ما تريد معرفته
          </h2>
          <p className="mt-3 text-muted-foreground">
            لم تجد إجابتك؟ تواصل معنا عبر واتساب.
          </p>
        </motion.div>

        <div className="space-y-3">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: i * 0.04, duration: 0.4 }}
                className={cn(
                  "overflow-hidden rounded-xl border transition-colors duration-200",
                  isOpen ? "border-accent/30 bg-card shadow-warm-sm" : "border-border bg-card/60",
                )}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-start"
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
                      key="answer"
                      variants={accordionContent}
                      initial="collapsed"
                      animate="expanded"
                      exit="collapsed"
                      style={{ overflow: "hidden" }}
                    >
                      <p className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">
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
