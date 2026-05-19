import { cn } from "@/lib/utils";

interface PlaceholderImageProps {
  emoji?: string;
  label?: string;
  sublabel?: string;
  gradient?: string;
  aspect?: "square" | "video" | "portrait" | "wide";
  className?: string;
  size?: "sm" | "md" | "lg";
}

const aspects = {
  square:   "aspect-square",
  video:    "aspect-video",
  portrait: "aspect-[4/5]",
  wide:     "aspect-[16/9]",
};

const emojiSizes = { sm: "text-4xl", md: "text-6xl", lg: "text-8xl" };

export function PlaceholderImage({
  emoji = "🫒",
  label,
  sublabel = "صورة قريباً",
  gradient = "from-amber-100 via-orange-50 to-yellow-100",
  aspect = "square",
  className,
  size = "md",
}: PlaceholderImageProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border/60 shadow-warm-md",
        aspects[aspect],
        className,
      )}
    >
      <div className={cn("absolute inset-0 bg-gradient-to-br", gradient)} />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-6 text-center">
        <span className={cn("drop-shadow-sm", emojiSizes[size])} aria-hidden>
          {emoji}
        </span>
        {label && (
          <p className="text-sm font-semibold text-foreground/80">{label}</p>
        )}
        <p className="text-xs text-muted-foreground/80">{sublabel}</p>
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-foreground/5 to-transparent"
      />
    </div>
  );
}
