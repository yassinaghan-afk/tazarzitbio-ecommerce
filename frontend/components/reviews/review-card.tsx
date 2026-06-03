"use client";

import { Star } from "lucide-react";

import { useTranslation } from "@/lib/i18n/language-provider";
import { cn } from "@/lib/utils";

export interface ReviewCardProps {
  author: string;
  city: string;
  rating: number;
  date: string;
  content: string;
  product?: string;
  verified?: boolean;
  className?: string;
}

function StarRating({ rating }: { rating: number }) {
  const { t } = useTranslation();

  return (
    <div
      className="flex items-center gap-0.5"
      aria-label={t("review.starsOutOf", { rating })}
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            "size-4",
            i < rating ? "fill-accent text-accent" : "fill-border text-border",
          )}
        />
      ))}
    </div>
  );
}

export function ReviewCard({
  author,
  city,
  rating,
  date,
  content,
  product,
  verified = true,
  className,
}: ReviewCardProps) {
  const { t } = useTranslation();

  return (
    <article
      className={cn(
        "flex flex-col gap-4 rounded-2xl border border-border/70 bg-card p-6 shadow-warm-md ring-1 ring-white/40 transition-shadow hover:shadow-warm-lg",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <StarRating rating={rating} />
        {product && (
          <span className="shrink-0 text-xs text-muted-foreground">{product}</span>
        )}
      </div>

      <blockquote className="flex-1 text-sm leading-relaxed text-foreground/80">
        {content}
      </blockquote>

      <div className="flex items-center justify-between gap-2 border-t border-border pt-4">
        <div>
          <p className="text-sm font-semibold text-foreground">{author}</p>
          <p className="text-xs text-muted-foreground">
            {city} · {date}
          </p>
        </div>
        {verified && (
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-2xs font-semibold text-emerald-700">
            {t("review.verified")}
          </span>
        )}
      </div>
    </article>
  );
}
