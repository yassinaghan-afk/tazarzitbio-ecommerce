"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Coffee, Package, Heart, Zap } from "lucide-react";

import { Container, Section } from "@/components/layout/container";
import { BundleCard } from "@/components/product/bundle-card";
import { useCommerce } from "@/components/providers/commerce-provider";
import { SectionHeader } from "@/components/sections/section-header";
import { PremiumImage } from "@/components/ui/premium-image";
import { Button } from "@/components/ui/button";
import { familyPacks } from "@/lib/home-data";
import { fadeUp, staggerContainer, staggerItem, VIEWPORT } from "@/lib/animations";
import {
  buildAddToCartPayload,
  getStartingOffer,
} from "@/lib/cart/product-payload";
import { getPublicProductBySlug } from "@/lib/products/catalog";

const hospitalityPoints = [
  { icon: Package, title: "قيمة عائلية", desc: "تشكيلة عملية بسعر أوفر" },
  { icon: Coffee, title: "فطور العائلة", desc: "مائدة مغربية في باقة واحدة" },
  { icon: Heart, title: "جودة سوس", desc: "منتجات طبيعية من مصدر موثوق" },
];

const FEATURED_PACK_SLUG = "premium-family-pack";

export function FamilyPackSection() {
  const { orderNow } = useCommerce();
  const featuredPack = familyPacks.find((p) => p.isPopular) ?? familyPacks[0];

  const handleFeaturedOrder = () => {
    const product = getPublicProductBySlug(FEATURED_PACK_SLUG);
    if (!product) return;
    orderNow(buildAddToCartPayload(product, getStartingOffer(product)));
  };

  return (
    <Section id="bundles" spacing="lg" bg="alt" className="texture-grain">
      <Container>
        <SectionHeader
          label="عرض العائلة"
          title="باقة العائلة — قيمة ممتازة"
          description="تشكيلة فاخرة من أملو، مكسرات، وزيت أركان — اطلب الآن والدفع عند الاستلام."
          align="center"
        />

        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT}
          className="mt-8 overflow-hidden rounded-3xl border border-accent/30 bg-gradient-to-br from-amber-50 via-card to-orange-50 shadow-warm-xl"
        >
          <div className="grid items-center gap-8 p-6 md:grid-cols-2 md:p-10">
            <Link
              href={`/products/${FEATURED_PACK_SLUG}`}
              className="block transition-opacity hover:opacity-95"
            >
              <PremiumImage
                src="/images/products/pack.png"
                alt="باقة عائلية تازارزيت بيو"
                aspect="landscape"
                sizes="(max-width: 768px) 100vw, 480px"
                className="shadow-warm-md"
              />
            </Link>
            <div className="flex flex-col gap-5 text-center md:text-start">
              <div>
                <p className="text-sm font-bold text-accent">الأكثر طلباً ⭐</p>
                <h3 className="mt-1 text-2xl font-extrabold text-foreground sm:text-3xl">
                  {featuredPack.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
                  {featuredPack.description}
                </p>
              </div>
              <p className="text-3xl font-extrabold tabular-nums text-accent">
                {featuredPack.price}
                <span className="ms-1 text-lg font-semibold">د.م.</span>
              </p>
              <Button
                variant="gold"
                size="xl"
                className="min-h-12 h-12 w-full gap-2 rounded-xl text-base font-bold shadow-gold md:max-w-sm"
                onClick={handleFeaturedOrder}
              >
                <Zap className="size-5" />
                اطلب الآن
              </Button>
            </div>
          </div>
        </motion.div>

        <div className="mb-14 mt-12 grid gap-6 md:grid-cols-3">
          {hospitalityPoints.map((point, i) => (
            <motion.div
              key={point.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={VIEWPORT}
              transition={{ delay: i * 0.08, duration: 0.45 }}
              className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-warm-sm"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent/10">
                <point.icon className="size-6 text-accent" />
              </div>
              <div>
                <p className="font-bold text-foreground">{point.title}</p>
                <p className="text-sm text-muted-foreground">{point.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT}
          className="flex flex-col gap-5"
        >
          {familyPacks.map((pack) => (
            <motion.div key={pack.id} variants={staggerItem}>
              <BundleCard
                title={pack.title}
                description={pack.description}
                price={pack.price}
                items={pack.items}
                isPopular={pack.isPopular}
                variant={pack.variant}
                productSlug={pack.slug}
              />
            </motion.div>
          ))}
        </motion.div>
      </Container>
    </Section>
  );
}
