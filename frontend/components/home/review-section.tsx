"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";

import { Container, Section } from "@/components/layout/container";
import { ReviewCard } from "@/components/reviews/review-card";
import { staggerContainer, staggerItem, VIEWPORT } from "@/lib/animations";

const reviews = [
  {
    id: "1",
    author: "فاطمة الزهراء",
    city:   "الدار البيضاء",
    rating: 5,
    date:   "مايو 2026",
    content:
      "أملو تازارزيت هو أفضل أملو جربته في حياتي. الطعم طبيعي 100% وأحس بالفرق الكبير مقارنة بما يُباع في السوق. التغليف أنيق جداً وجاء في الوقت المحدد.",
    product: "أملو الكلاسيكي",
    verified: true,
  },
  {
    id: "2",
    author: "يوسف بنعلي",
    city:   "الرباط",
    rating: 5,
    date:   "أبريل 2026",
    content:
      "اشتريت علبة هدية لعيد الفطر وكانت مفاجأة رائعة للعائلة. الجودة عالية جداً والتغليف فاخر. سأكرر الطلب بالتأكيد.",
    product: "علبة هدية فاخرة",
    verified: true,
  },
  {
    id: "3",
    author: "نادية السوسي",
    city:   "أكادير",
    rating: 5,
    date:   "مارس 2026",
    content:
      "أخيراً وجدت زيت أركان حقيقي! جربت الكثير من الماركات لكن تازارزيت بيو يتفوق على الجميع. الدفع عند الاستلام جعل الطلب سهلاً ومريحاً.",
    product: "زيت أركان طبيعي",
    verified: true,
  },
];

export function ReviewSection() {
  return (
    <Section id="reviews" spacing="lg" bg="alt">
      <Container>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={VIEWPORT}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center"
        >
          <p className="text-sm font-semibold uppercase tracking-widest text-accent">
            آراء العملاء
          </p>
          <h2 className="mt-2 text-3xl font-bold text-foreground md:text-4xl">
            ماذا يقولون عنّا
          </h2>

          {/* Rating summary */}
          <div className="mx-auto mt-4 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-5 py-2">
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="size-4 fill-accent text-accent" />
              ))}
            </div>
            <span className="text-sm font-bold text-foreground">4.9 / 5</span>
            <span className="text-xs text-muted-foreground">من 200+ تقييم</span>
          </div>
        </motion.div>

        {/* Cards */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT}
          className="grid gap-5 md:grid-cols-2 lg:grid-cols-3"
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
                verified={review.verified}
                className="h-full"
              />
            </motion.div>
          ))}
        </motion.div>
      </Container>
    </Section>
  );
}
