"use client";

import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

import { Container, Section } from "@/components/layout/container";
import { SectionHeader } from "@/components/sections/section-header";
import { PlaceholderImage } from "@/components/ui/placeholder-image";
import { storyPillars } from "@/lib/home-data";
import { slideInEnd, slideInStart, staggerContainer, staggerItem, VIEWPORT } from "@/lib/animations";

const values = [
  "مكونات مختارة يدوياً من مزارعي سوس",
  "تحضير تقليدي دون مواد حافظة",
  "شراكات مباشرة مع منتجين محليين",
  "تغليف فاخر يليق بالإهداء والضيافة",
];

export function StorySection() {
  return (
    <Section id="story" spacing="lg">
      <Container>
        <SectionHeader
          label="قصتنا"
          title="من قلب سوس إلى مائدتك"
          description="في تازارزيت بيو نحمل موروثاً غذائياً أصيلاً — بجودة تليق بكرم الضيافة المغربية."
          align="center"
        />

        <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
          <motion.div
            variants={slideInStart}
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT}
          >
            <PlaceholderImage
              emoji="🏔️"
              label="سوس — أرض الأركان والعسل"
              gradient="from-emerald-50 via-teal-50 to-amber-50"
              aspect="portrait"
              size="lg"
              className="shadow-warm-xl"
            />
          </motion.div>

          <motion.div
            variants={slideInEnd}
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT}
            className="flex flex-col gap-8"
          >
            <p className="text-lg leading-relaxed text-muted-foreground">
              وُلدت تازارزيت بيو من حبٍّ للأرض والتقاليد. في كل مرحلة — من الحصاد
              إلى التغليف — نحرص على أن تبقى المنتجات <strong className="text-foreground">طبيعية 100%</strong>،
              بلا اختصارات ولا إضافات صناعية.
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
              {storyPillars.map((pillar) => (
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
