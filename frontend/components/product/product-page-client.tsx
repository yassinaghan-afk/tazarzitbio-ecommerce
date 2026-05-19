"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Check,
  ChevronDown,
  Leaf,
  ShieldCheck,
  ShoppingBag,
  Truck,
} from "lucide-react";

import { CatalogProductCard } from "@/components/catalog/catalog-product-card";
import { Container, Section } from "@/components/layout/container";
import { useCommerce } from "@/components/providers/commerce-provider";
import { ProductImageGallery } from "@/components/product/product-image-gallery";
import { ReviewCard } from "@/components/reviews/review-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { fadeUp } from "@/lib/animations";
import type { Product, ProductOffer } from "@/lib/products";
import { BADGE_LABELS, getRelatedProducts } from "@/lib/products";
import { cn } from "@/lib/utils";

interface ProductPageClientProps {
  product: Product;
}

const trustItems = [
  { icon: ShieldCheck, text: "طبيعي 100%" },
  { icon: Truck, text: "الدفع عند الاستلام" },
  { icon: Leaf, text: "من قلب سوس" },
];

export function ProductPageClient({ product }: ProductPageClientProps) {
  const { addToCart } = useCommerce();
  const [selectedOffer, setSelectedOffer] = useState<ProductOffer>(
    product.offers[0],
  );
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const related = getRelatedProducts(product.relatedSlugs);
  const savings =
    selectedOffer.oldPrice != null
      ? selectedOffer.oldPrice - selectedOffer.price
      : 0;

  const handleAddToCart = () => {
    addToCart({
      productId: product.id,
      slug: product.slug,
      nameAr: product.nameAr,
      image: product.image,
      offerId: selectedOffer.id,
      offerLabel: selectedOffer.label,
      unitPrice: selectedOffer.price,
    });
  };

  return (
    <>
      <Section spacing="md" className="texture-grain pb-28 lg:pb-16">
        <Container>
          <nav className="mb-8 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-accent">
              الرئيسية
            </Link>
            <span className="mx-2">/</span>
            <Link href="/products" className="hover:text-accent">
              المنتجات
            </Link>
            <span className="mx-2">/</span>
            <span className="text-foreground">{product.nameAr}</span>
          </nav>

          <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
            <ProductImageGallery images={product.images} alt={product.nameAr} />

            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="flex flex-col gap-6"
            >
              <div className="flex flex-wrap gap-2">
                {product.badges.map((b) => (
                  <Badge key={b} variant="premium">
                    {BADGE_LABELS[b]}
                  </Badge>
                ))}
              </div>

              <div>
                <h1 className="text-display text-3xl text-foreground sm:text-4xl">
                  {product.nameAr}
                </h1>
                <p className="mt-3 text-base leading-relaxed text-muted-foreground sm:text-lg">
                  {product.shortDescription}
                </p>
              </div>

              <div className="flex flex-wrap gap-4">
                {trustItems.map(({ icon: Icon, text }) => (
                  <span
                    key={text}
                    className="glass-card flex items-center gap-2 rounded-full px-3 py-2 text-xs font-medium"
                  >
                    <Icon className="size-4 text-accent" />
                    {text}
                  </span>
                ))}
              </div>

              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-extrabold tabular-nums text-accent">
                  {selectedOffer.price}
                  <span className="ms-1 text-lg font-semibold">د.م.</span>
                </span>
                {selectedOffer.oldPrice && (
                  <span className="text-lg text-muted-foreground line-through tabular-nums">
                    {selectedOffer.oldPrice} د.م.
                  </span>
                )}
                {savings > 0 && (
                  <Badge variant="success">وفّر {savings} د.م.</Badge>
                )}
              </div>

              <div className="space-y-3">
                <p className="text-sm font-bold text-foreground">اختر العرض</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {product.offers.map((offer) => (
                    <button
                      key={offer.id}
                      type="button"
                      onClick={() => setSelectedOffer(offer)}
                      className={cn(
                        "rounded-2xl border p-4 text-start transition-all",
                        selectedOffer.id === offer.id
                          ? "border-accent bg-accent/5 shadow-warm-sm ring-1 ring-accent/30"
                          : "border-border bg-card/50 hover:border-accent/30",
                      )}
                    >
                      <p className="font-bold text-foreground">{offer.label}</p>
                      {offer.hint && (
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {offer.hint}
                        </p>
                      )}
                      <p className="mt-2 text-sm font-extrabold text-accent">
                        {offer.price} د.م.
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <Button
                variant="gold"
                size="xl"
                className="hidden w-full gap-2 rounded-full shadow-gold lg:inline-flex"
                onClick={handleAddToCart}
              >
                <ShoppingBag className="size-5" />
                أضف إلى السلة
              </Button>

              <p className="hidden text-center text-xs text-muted-foreground lg:block">
                الدفع عند الاستلام · توصيل لجميع المدن المغربية
              </p>
            </motion.div>
          </div>
        </Container>
      </Section>

      <Section spacing="md" bg="alt">
        <Container className="max-w-3xl">
          <h2 className="text-display mb-4 text-2xl text-foreground">عن المنتج</h2>
          <p className="text-base leading-[1.85] text-muted-foreground">
            {product.description}
          </p>
        </Container>
      </Section>

      <Section spacing="md">
        <Container>
          <div className="grid gap-10 md:grid-cols-3">
            <div>
              <h2 className="text-display mb-4 text-xl text-foreground">
                المكونات
              </h2>
              <ul className="space-y-2">
                {product.ingredients.map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-2 text-sm text-foreground/85"
                  >
                    <Check className="size-4 text-accent" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="text-display mb-4 text-xl text-foreground">
                الفوائد
              </h2>
              <ul className="space-y-2">
                {product.benefits.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2 text-sm text-foreground/85"
                  >
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="text-display mb-4 text-xl text-foreground">
                اقتراحات الاستخدام
              </h2>
              <ul className="space-y-2">
                {product.usageSuggestions.map((item) => (
                  <li
                    key={item}
                    className="text-sm leading-relaxed text-muted-foreground"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Container>
      </Section>

      <Section spacing="md" bg="alt">
        <Container>
          <h2 className="text-display mb-8 text-2xl text-foreground">
            آراء العملاء
          </h2>
          <div className="grid gap-5 sm:grid-cols-2">
            {product.reviews.map((review) => (
              <ReviewCard
                key={review.id}
                author={review.author}
                city={review.city}
                rating={review.rating}
                date={review.date}
                content={review.content}
                product={product.nameAr}
              />
            ))}
          </div>
        </Container>
      </Section>

      <Section spacing="md">
        <Container className="max-w-2xl">
          <h2 className="text-display mb-6 text-2xl text-foreground">
            أسئلة شائعة
          </h2>
          <div className="space-y-2">
            {product.faq.map((item, i) => (
              <motion.div
                key={item.q}
                initial={false}
                className="overflow-hidden rounded-2xl border border-border/70 bg-card"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-start"
                >
                  <span className="font-bold text-foreground">{item.q}</span>
                  <ChevronDown
                    className={cn(
                      "size-5 shrink-0 text-muted-foreground transition-transform",
                      openFaq === i && "rotate-180",
                    )}
                  />
                </button>
                {openFaq === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    className="border-t border-border/50 px-5 py-4 text-sm leading-relaxed text-muted-foreground"
                  >
                    {item.a}
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </Container>
      </Section>

      {related.length > 0 && (
        <Section spacing="lg">
          <Container>
            <h2 className="text-display mb-8 text-2xl text-foreground">
              منتجات ذات صلة
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => (
                <CatalogProductCard key={p.id} product={p} />
              ))}
            </div>
          </Container>
        </Section>
      )}

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-card/95 p-4 backdrop-blur-lg lg:hidden">
        <div className="mx-auto flex max-w-lg items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold">{product.nameAr}</p>
            <p className="text-lg font-extrabold tabular-nums text-accent">
              {selectedOffer.price} د.م.
            </p>
          </div>
          <Button
            variant="gold"
            size="lg"
            className="shrink-0 gap-2 rounded-full px-6 shadow-gold"
            onClick={handleAddToCart}
          >
            <ShoppingBag className="size-4" />
            أضف للسلة
          </Button>
        </div>
      </div>
    </>
  );
}
