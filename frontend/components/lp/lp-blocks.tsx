"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ChevronDown, MessageCircle, ShieldCheck, Star } from "lucide-react";

import { useCommerce } from "@/components/providers/commerce-provider";
import { Button } from "@/components/ui/button";
import type { LpBlock } from "@/lib/admin/cms-types";
import type { Product } from "@/lib/products/types";
import { cn } from "@/lib/utils";

const BG_CLASSES: Record<LpBlock["background"], string> = {
  default: "bg-background",
  alt: "bg-secondary/40",
  dark: "bg-foreground text-background",
  gold: "bg-gold-gradient",
};

function BlockShell({
  block,
  children,
  className,
}: {
  block: LpBlock;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("px-4 py-10 sm:py-14", BG_CLASSES[block.background])}>
      <div className={cn("mx-auto w-full max-w-3xl", className)}>{children}</div>
    </section>
  );
}

function CtaButton({ block, whatsapp }: { block: LpBlock; whatsapp?: string }) {
  if (!block.ctaText) return null;
  const href =
    block.type === "whatsapp"
      ? `https://wa.me/${(whatsapp ?? "").replace(/\D/g, "")}`
      : block.ctaHref || "#";
  const external = href.startsWith("http");
  return (
    <Button variant="gold" size="xl" className="min-h-12 rounded-full px-8 shadow-gold" asChild>
      {external ? (
        <a href={href} target="_blank" rel="noopener noreferrer">
          {block.type === "whatsapp" && <MessageCircle className="me-2 size-5" />}
          {block.ctaText}
        </a>
      ) : (
        <Link href={href}>{block.ctaText}</Link>
      )}
    </Button>
  );
}

function Countdown({ to }: { to: string }) {
  const target = useMemo(() => new Date(to).getTime(), [to]);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const diff = Math.max(0, target - now);
  const days = Math.floor(diff / 86_400_000);
  const hours = Math.floor((diff % 86_400_000) / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);
  const seconds = Math.floor((diff % 60_000) / 1000);

  const cells = [
    { v: days, l: "أيام" },
    { v: hours, l: "ساعات" },
    { v: minutes, l: "دقائق" },
    { v: seconds, l: "ثواني" },
  ];

  return (
    <div className="flex justify-center gap-3" dir="ltr">
      {cells.map((c) => (
        <div
          key={c.l}
          className="flex min-w-16 flex-col items-center rounded-2xl border border-accent/30 bg-card px-3 py-2 shadow-warm-sm"
        >
          <span className="text-2xl font-extrabold tabular-nums text-accent">
            {String(c.v).padStart(2, "0")}
          </span>
          <span className="text-2xs text-muted-foreground">{c.l}</span>
        </div>
      ))}
    </div>
  );
}

function OfferBlock({ block, product }: { block: LpBlock; product?: Product }) {
  const { orderNow } = useCommerce();
  if (!product) {
    return (
      <BlockShell block={block} className="text-center">
        {block.title && <h2 className="text-2xl font-extrabold">{block.title}</h2>}
        <CtaButton block={block} />
      </BlockShell>
    );
  }
  const offer = product.offers[0];
  return (
    <BlockShell block={block}>
      <div className="grid items-center gap-8 rounded-3xl border border-accent/20 bg-card p-6 shadow-warm-lg sm:grid-cols-2 sm:p-8">
        <div className="relative aspect-square overflow-hidden rounded-2xl bg-secondary/40">
          <Image
            src={block.imageUrl || product.image}
            alt={product.nameAr}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 50vw"
          />
        </div>
        <div className="space-y-4 text-center sm:text-start">
          <h2 className="text-2xl font-extrabold text-foreground">
            {block.title || product.nameAr}
          </h2>
          {(block.text || product.shortDescription) && (
            <p className="text-sm leading-relaxed text-muted-foreground">
              {block.text || product.shortDescription}
            </p>
          )}
          <p className="text-3xl font-extrabold text-accent tabular-nums">
            {product.price} د.م.
          </p>
          <Button
            variant="gold"
            size="xl"
            className="min-h-12 w-full rounded-full shadow-gold sm:w-auto sm:px-10"
            onClick={() =>
              offer &&
              orderNow({
                productId: product.id,
                slug: product.slug,
                nameAr: product.nameAr,
                image: product.image,
                offerId: offer.id,
                offerLabel: offer.label,
                unitPrice: offer.economics.salePrice,
                isBundle: product.category === "bundles" || undefined,
              })
            }
          >
            {block.ctaText || "اطلب الآن — الدفع عند الاستلام"}
          </Button>
        </div>
      </div>
    </BlockShell>
  );
}

function FaqItems({ block }: { block: LpBlock }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="space-y-3">
      {block.items.map((item, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-xl border border-border bg-card"
        >
          <button
            type="button"
            onClick={() => setOpen(open === i ? null : i)}
            className="flex min-h-11 w-full items-center justify-between gap-3 px-5 py-3 text-start"
          >
            <span className="text-sm font-semibold">{item.title}</span>
            <ChevronDown
              className={cn(
                "size-4 shrink-0 text-muted-foreground transition-transform",
                open === i && "rotate-180 text-accent",
              )}
            />
          </button>
          {open === i && (
            <p className="border-t border-border/60 px-5 py-3 text-sm leading-relaxed text-muted-foreground">
              {item.body}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

export function LpBlocksRenderer({
  blocks,
  product,
  whatsapp,
}: {
  blocks: LpBlock[];
  product?: Product;
  whatsapp?: string;
}) {
  return (
    <div>
      {blocks
        .filter((b) => b.isVisible)
        .map((block) => {
          switch (block.type) {
            case "hero":
              return (
                <section
                  key={block.id}
                  className={cn(
                    "relative overflow-hidden px-4 py-16 text-center sm:py-24",
                    BG_CLASSES[block.background],
                  )}
                >
                  {block.imageUrl && (
                    <>
                      <Image
                        src={block.imageUrl}
                        alt={block.title || ""}
                        fill
                        className="object-cover"
                        priority
                        sizes="100vw"
                      />
                      <div className="absolute inset-0 bg-black/45" />
                    </>
                  )}
                  <div
                    className={cn(
                      "relative z-10 mx-auto max-w-2xl space-y-5",
                      block.imageUrl && "text-white",
                    )}
                  >
                    {block.title && (
                      <h1 className="text-4xl font-extrabold leading-tight sm:text-5xl">
                        {block.title}
                      </h1>
                    )}
                    {block.subtitle && (
                      <p className="text-lg opacity-90">{block.subtitle}</p>
                    )}
                    <CtaButton block={block} />
                  </div>
                </section>
              );

            case "heading":
              return (
                <BlockShell key={block.id} block={block} className="text-center">
                  <h2 className="text-3xl font-extrabold">{block.title}</h2>
                  {block.subtitle && (
                    <p className="mt-2 text-muted-foreground">{block.subtitle}</p>
                  )}
                </BlockShell>
              );

            case "text":
              return (
                <BlockShell key={block.id} block={block}>
                  {block.title && (
                    <h2 className="mb-4 text-2xl font-extrabold">{block.title}</h2>
                  )}
                  <div className="space-y-4 text-base leading-[1.9] text-foreground/85">
                    {block.text.split(/\n{2,}/).map((p, i) => (
                      <p key={i}>{p}</p>
                    ))}
                  </div>
                </BlockShell>
              );

            case "image":
              return block.imageUrl ? (
                <BlockShell key={block.id} block={block}>
                  <div className="relative aspect-[16/10] overflow-hidden rounded-3xl">
                    <Image
                      src={block.imageUrl}
                      alt={block.title || ""}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 768px"
                    />
                  </div>
                  {block.title && (
                    <p className="mt-3 text-center text-sm text-muted-foreground">
                      {block.title}
                    </p>
                  )}
                </BlockShell>
              ) : null;

            case "gallery":
              return (
                <BlockShell key={block.id} block={block}>
                  {block.title && (
                    <h2 className="mb-5 text-center text-2xl font-extrabold">
                      {block.title}
                    </h2>
                  )}
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {block.images.map((src, i) => (
                      <div
                        key={i}
                        className="relative aspect-square overflow-hidden rounded-2xl"
                      >
                        <Image
                          src={src}
                          alt={`${block.title || "gallery"} ${i + 1}`}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 50vw, 33vw"
                        />
                      </div>
                    ))}
                  </div>
                </BlockShell>
              );

            case "video":
              return block.videoUrl ? (
                <BlockShell key={block.id} block={block}>
                  {block.title && (
                    <h2 className="mb-5 text-center text-2xl font-extrabold">
                      {block.title}
                    </h2>
                  )}
                  <video
                    src={block.videoUrl}
                    controls
                    playsInline
                    className="w-full rounded-3xl"
                  />
                </BlockShell>
              ) : null;

            case "cta":
            case "whatsapp":
              return (
                <BlockShell key={block.id} block={block} className="text-center">
                  {block.title && (
                    <h2 className="mb-2 text-2xl font-extrabold">{block.title}</h2>
                  )}
                  {block.text && (
                    <p className="mb-5 text-muted-foreground">{block.text}</p>
                  )}
                  <CtaButton block={block} whatsapp={whatsapp} />
                </BlockShell>
              );

            case "benefits":
              return (
                <BlockShell key={block.id} block={block}>
                  {block.title && (
                    <h2 className="mb-6 text-center text-2xl font-extrabold">
                      {block.title}
                    </h2>
                  )}
                  <ul className="grid gap-4 sm:grid-cols-2">
                    {block.items.map((item, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4"
                      >
                        <ShieldCheck className="mt-0.5 size-5 shrink-0 text-accent" />
                        <div>
                          <p className="font-bold">{item.title}</p>
                          {item.body && (
                            <p className="mt-1 text-sm text-muted-foreground">
                              {item.body}
                            </p>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </BlockShell>
              );

            case "testimonial":
              return (
                <BlockShell key={block.id} block={block}>
                  {block.title && (
                    <h2 className="mb-6 text-center text-2xl font-extrabold">
                      {block.title}
                    </h2>
                  )}
                  <div className="grid gap-4 sm:grid-cols-2">
                    {block.items.map((item, i) => (
                      <figure
                        key={i}
                        className="rounded-2xl border border-border bg-card p-5"
                      >
                        <div className="mb-2 flex gap-0.5">
                          {Array.from({ length: 5 }).map((_, s) => (
                            <Star key={s} className="size-4 fill-accent text-accent" />
                          ))}
                        </div>
                        <blockquote className="text-sm leading-relaxed text-foreground/85">
                          {item.body}
                        </blockquote>
                        <figcaption className="mt-3 text-xs font-bold text-muted-foreground">
                          {item.title}
                        </figcaption>
                      </figure>
                    ))}
                  </div>
                </BlockShell>
              );

            case "faq":
              return (
                <BlockShell key={block.id} block={block}>
                  {block.title && (
                    <h2 className="mb-6 text-center text-2xl font-extrabold">
                      {block.title}
                    </h2>
                  )}
                  <FaqItems block={block} />
                </BlockShell>
              );

            case "offer":
              return <OfferBlock key={block.id} block={block} product={product} />;

            case "countdown":
              return (
                <BlockShell key={block.id} block={block} className="text-center">
                  {block.title && (
                    <h2 className="mb-5 text-2xl font-extrabold">{block.title}</h2>
                  )}
                  {block.countdownTo && <Countdown to={block.countdownTo} />}
                </BlockShell>
              );

            case "guarantee":
              return (
                <BlockShell key={block.id} block={block} className="text-center">
                  <div className="mx-auto max-w-xl rounded-3xl border border-accent/25 bg-accent/5 p-8">
                    <ShieldCheck className="mx-auto size-10 text-accent" />
                    <h2 className="mt-3 text-xl font-extrabold">
                      {block.title || "ضمان الجودة"}
                    </h2>
                    {block.text && (
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                        {block.text}
                      </p>
                    )}
                  </div>
                </BlockShell>
              );

            case "divider":
              return (
                <div key={block.id} className={BG_CLASSES[block.background]}>
                  <div className="section-divider mx-auto max-w-4xl" />
                </div>
              );

            default:
              return null;
          }
        })}
    </div>
  );
}
