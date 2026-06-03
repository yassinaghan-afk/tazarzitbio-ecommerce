"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Check,
  ChevronDown,
  Leaf,
  MapPin,
  Phone,
  ShieldCheck,
  Truck,
  Zap,
  ShoppingBag,
} from "lucide-react";

import { CatalogProductCard } from "@/components/catalog/catalog-product-card";
import { Container, Section } from "@/components/layout/container";
import { ProductImageGallery } from "@/components/product/product-image-gallery";
import { ProductPurchaseActions } from "@/components/product/product-purchase-actions";
import { QuantitySelector } from "@/components/product/quantity-selector";
import { useCommerce } from "@/components/providers/commerce-provider";
import { Button } from "@/components/ui/button";
import { buildAddToCartPayload } from "@/lib/cart/product-payload";
import { isFamilyPackProduct } from "@/lib/brand";
import { FamilyPackContentsSection } from "@/components/product/family-pack-contents-section";
import { FamilyPackStoryVisual } from "@/components/product/family-pack-story-visual";
import { ShippingPromoBanner } from "@/components/product/shipping-promo-banner";
import { ReviewCard } from "@/components/reviews/review-card";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "@/components/ui/star-rating";
import { useCatalogProduct } from "@/hooks/use-catalog";
import { fadeUp } from "@/lib/animations";
import type { PublicProduct, PublicProductOffer } from "@/lib/products";
import { BADGE_LABELS, getRelatedProducts } from "@/lib/products";
import { cn } from "@/lib/utils";
import { trackViewContent } from "@/lib/tracking/events";

interface ProductPageClientProps {
  slug: string;
  initialProduct?: PublicProduct;
}

const pdpTrust = [
  { icon: Truck, text: "الدفع عند الاستلام" },
  { icon: MapPin, text: "توصيل لجميع المدن" },
  { icon: Phone, text: "فريقنا يتصل بك لتأكيد الطلب" },
  { icon: Leaf, text: "منتجات طبيعية من قلب سوس" },
];

export function ProductPageClient({
  slug,
  initialProduct,
}: ProductPageClientProps) {
  const { orderNow, addToCart } = useCommerce();
  const { publicProduct: liveProduct } = useCatalogProduct(slug);
  const product = liveProduct ?? initialProduct;

  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(
    () => initialProduct?.offers[0]?.id ?? null,
  );
  const [quantity, setQuantity] = useState(1);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    const source = liveProduct ?? initialProduct;
    const firstId = source?.offers[0]?.id ?? null;
    setSelectedOfferId((current) => {
      if (current && source?.offers.some((o) => o.id === current)) {
        return current;
      }
      return firstId;
    });
    setQuantity(1);
    // Reset size selection only when the product slug changes (not when offers[] is recreated).
    // eslint-disable-next-line react-hooks/exhaustive-deps -- slug-only; offer prices sync via derived selectedOffer
  }, [slug]);

  const selectedOffer: PublicProductOffer | null =
    product?.offers.find((o) => o.id === selectedOfferId) ??
    product?.offers[0] ??
    null;

  useEffect(() => {
    if (!product || !selectedOffer) return;
    trackViewContent({
      productId: product.id,
      slug: product.slug,
      name: product.nameAr,
      price: selectedOffer.price,
      quantity: 1,
    });
  }, [product, selectedOffer]);

  if (!product || !selectedOffer) {
    return null;
  }

  const related = getRelatedProducts(
    product.relatedSlugs.filter((s) => s !== product.slug),
  );
  const showSizePicker = product.offers.length > 1;
  const orderOnly = isFamilyPackProduct(product.slug);

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
              className="flex flex-col gap-5"
            >
              <div className="flex flex-wrap items-center gap-3">
                {product.badges.map((b) => (
                  <Badge key={b} variant="premium">
                    {BADGE_LABELS[b]}
                  </Badge>
                ))}
                <StarRating rating={product.rating} showValue />
                <span className="text-xs text-muted-foreground">
                  ({product.reviewCount} تقييم)
                </span>
              </div>

              <div>
                <h1 className="text-display text-3xl text-foreground sm:text-4xl">
                  {product.nameAr}
                </h1>
                <p className="mt-3 text-base leading-relaxed text-muted-foreground sm:text-lg">
                  {product.shortDescription}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {pdpTrust.map(({ icon: Icon, text }) => (
                  <span
                    key={text}
                    className="glass-card flex items-center gap-2 rounded-full px-3 py-2 text-xs font-medium text-foreground/90"
                  >
                    <Icon className="size-4 shrink-0 text-accent" />
                    {text}
                  </span>
                ))}
              </div>

              <div className="rounded-2xl border border-accent/20 bg-accent/5 p-4">
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-extrabold tabular-nums text-accent">
                    {selectedOffer.price}
                  </span>
                  <span className="text-lg font-semibold text-accent">د.م.</span>
                  <span className="text-sm text-muted-foreground">
                    {selectedOffer.weight}
                  </span>
                </div>
                {selectedOffer.hint && (
                  <p className="mt-1 text-sm font-medium text-foreground/80">
                    {selectedOffer.hint}
                  </p>
                )}
              </div>

              {showSizePicker && (
                <div className="space-y-3">
                  <p className="text-sm font-bold text-foreground">اختر الحجم</p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {product.offers.map((offer) => (
                      <button
                        key={offer.id}
                        type="button"
                        onClick={() => setSelectedOfferId(offer.id)}
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
              )}

              <ProductPurchaseActions
                product={product}
                offer={selectedOffer}
                quantity={quantity}
                onQuantityChange={setQuantity}
                orderOnly={orderOnly}
                className="hidden lg:flex"
              />

              <ShippingPromoBanner />
            </motion.div>
          </div>
        </Container>
      </Section>

      {isFamilyPackProduct(product.slug) && <FamilyPackContentsSection />}

      <Section spacing="md" bg="alt" className="!pt-8 sm:!pt-10">
        <Container className="max-w-3xl">
          <h2 className="text-display mb-4 text-2xl text-foreground">عن المنتج</h2>
          <p className="text-base leading-[1.85] text-muted-foreground">
            {product.description}
          </p>
        </Container>
        {isFamilyPackProduct(product.slug) && (
          <FamilyPackStoryVisual className="mt-6 sm:mt-8 lg:mt-10" />
        )}
      </Section>

      <Section spacing="md">
        <Container>
          <div className="grid gap-10 md:grid-cols-3">
            <div className="rounded-2xl border border-border/60 bg-card/50 p-6">
              <h2 className="text-display mb-4 text-xl text-foreground">المكونات</h2>
              <ul className="space-y-2">
                {product.ingredients.map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-2 text-sm text-foreground/85"
                  >
                    <Check className="size-4 shrink-0 text-accent" />
                    {item}
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
                مكونات طبيعية مختارة من مزارعي سوس — دون مواد حافظة أو إضافات
                صناعية.
              </p>
            </div>
            <div className="rounded-2xl border border-border/60 bg-card/50 p-6">
              <h2 className="text-display mb-4 text-xl text-foreground">لماذا تازارزيت؟</h2>
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
            <div className="rounded-2xl border border-border/60 bg-card/50 p-6">
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
          <div className="mb-8 flex items-center gap-3">
            <ShieldCheck className="size-8 text-accent" />
            <div>
              <h2 className="text-display text-2xl text-foreground">ثقة وخدمة</h2>
              <p className="text-sm text-muted-foreground">
                نرافقك من الطلب حتى الاستلام
              </p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {pdpTrust.map(({ icon: Icon, text }) => (
              <div
                key={text}
                className="flex items-start gap-3 rounded-2xl border border-border/60 bg-card p-4"
              >
                <Icon className="mt-0.5 size-5 shrink-0 text-accent" />
                <p className="text-sm font-semibold text-foreground">{text}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      <Section spacing="md">
        <Container>
          <h2 className="text-display mb-2 text-2xl text-foreground">
            آراء الزبناء
          </h2>
          <p className="mb-8 text-sm text-muted-foreground">
            تعليقات بالدارجة من مدن مغربية مختلفة
          </p>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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

      <Section spacing="md" bg="alt">
        <Container className="max-w-2xl">
          <h2 className="text-display mb-6 text-2xl text-foreground">
            أسئلة شائعة
          </h2>
          <div className="space-y-2">
            {product.faq.map((item, i) => (
              <div
                key={item.q}
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
                  <div className="border-t border-border/50 px-5 py-4 text-sm leading-relaxed text-muted-foreground">
                    {item.a}
                  </div>
                )}
              </div>
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

      <div className="fixed inset-x-0 bottom-0 z-40 w-full max-w-[100dvw] overflow-hidden border-t border-border/60 bg-card/95 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-lg lg:hidden">
        <div className="mx-auto w-full max-w-lg min-w-0 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold">{product.nameAr}</p>
              <p className="text-lg font-extrabold tabular-nums text-accent">
                {selectedOffer.price * quantity} د.م.
              </p>
              <p className="text-xs text-muted-foreground">
                {selectedOffer.label}
                {quantity > 1 ? ` × ${quantity}` : ""}
              </p>
            </div>
            <QuantitySelector value={quantity} onChange={setQuantity} />
          </div>
          <div className="flex flex-col gap-2.5">
            <Button
              variant="gold"
              size="lg"
              className="min-h-12 h-12 w-full gap-2 rounded-xl text-base font-bold shadow-gold"
              onClick={() =>
                orderNow(
                  buildAddToCartPayload(product, selectedOffer, { quantity }),
                )
              }
            >
              <Zap className="size-5" />
              اطلب الآن
            </Button>
            {!orderOnly && (
              <Button
                variant="outline"
                size="lg"
                className="min-h-12 h-12 w-full gap-2 rounded-xl text-base font-bold"
                onClick={() =>
                  addToCart(
                    buildAddToCartPayload(product, selectedOffer, {
                      quantity,
                      openDrawer: "cart",
                    }),
                  )
                }
              >
                <ShoppingBag className="size-5" />
                أضف للسلة
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
