"use client";

import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";

import { Container, Section } from "@/components/layout/container";
import { fadeUp, slideInEnd, slideInStart, VIEWPORT } from "@/lib/animations";

const values = [
  "مكونات مختارة يدوياً من مزارعي سوس",
  "تحضير تقليدي يحافظ على الطعم الأصيل",
  "لا مواد حافظة ولا إضافات صناعية",
  "تغليف صديق للبيئة ومناسب للإهداء",
  "الدفع عند الاستلام — ثقة بلا مخاطرة",
];

const stats = [
  { value: "+2000", label: "عميل سعيد" },
  { value: "8",     label: "منتجات طبيعية" },
  { value: "100%",  label: "من سوس" },
  { value: "COD",   label: "الدفع عند الاستلام" },
];

export function StorySection() {
  return (
    <Section id="story" spacing="lg">
      <Container>
        <div className="grid items-center gap-14 md:grid-cols-2">
          {/* Text */}
          <motion.div
            variants={slideInStart}
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT}
            className="flex flex-col gap-6"
          >
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-accent">
                قصتنا
              </p>
              <h2 className="mt-2 text-3xl font-bold leading-snug text-foreground md:text-4xl">
                من قلب سوس
                <br />
                إلى مائدتك
              </h2>
            </div>

            <p className="max-w-md text-base leading-relaxed text-muted-foreground">
              تازارزيت بيو وُلدت من شغف بالموروث الغذائي المغربي. نختار
              مكوناتنا من أفضل مزارعي منطقة سوس ونحضّر منتجاتنا بالطرق
              التقليدية التي توارثناها جيلاً بعد جيل.
            </p>

            <p className="max-w-md text-base leading-relaxed text-muted-foreground">
              هدفنا بسيط: أن تصل الجودة الحقيقية إلى كل بيت مغربي، بتغليف
              يليق بها وبسعر عادل وبدفع عند الاستلام.
            </p>

            <ul className="space-y-3">
              {values.map((v) => (
                <li key={v} className="flex items-start gap-3">
                  <CheckCircle className="mt-0.5 size-5 shrink-0 text-accent" aria-hidden />
                  <span className="text-sm text-foreground/80">{v}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Visual */}
          <motion.div
            variants={slideInEnd}
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT}
            className="flex flex-col gap-5"
          >
            {/* Image placeholder */}
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-border shadow-warm-xl">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-100 via-orange-50 to-yellow-100" />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-8 text-center">
                <span className="text-7xl" aria-hidden>🫒</span>
                <p className="text-lg font-bold text-foreground/80">
                  من سوس — جودة حقيقية
                </p>
                <p className="text-sm text-muted-foreground">
                  صور المنتجات الحقيقية قريباً
                </p>
              </div>
              {/* decorative corner */}
              <div className="absolute end-0 top-0 h-20 w-20 rounded-bl-3xl bg-accent/20" />
            </div>

            {/* Stats grid */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={VIEWPORT}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="grid grid-cols-4 gap-3"
            >
              {stats.map((s) => (
                <div
                  key={s.label}
                  className="flex flex-col items-center gap-1 rounded-xl border border-border bg-card p-3 text-center shadow-warm-sm"
                >
                  <span className="text-xl font-bold text-accent">{s.value}</span>
                  <span className="text-2xs font-medium text-muted-foreground">
                    {s.label}
                  </span>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </Container>
    </Section>
  );
}
